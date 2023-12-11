import z from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { fetchRedis } from "@/helpers/redis";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const session = await getServerSession(authOptions);

    const { id: idToAdd } = z.object({ id: z.string() }).parse(body);

    if (!session) return new Response("Unauthorized", { status: 401 });

    const isAlreadyFriends = await fetchRedis("sismember", `user:${session.user.id}:friends`, idToAdd);
    if (isAlreadyFriends) return new Response("AlreadyFriends", { status: 400 });

    const hasFriendRequest = await fetchRedis("sismember", `user:${session.user.id}:incoming_friend_requests`, idToAdd);
    if (!hasFriendRequest) return new Response("No Friend Request", { status: 400 });

    //notify added user
    pusherServer.trigger(toPusherKey(`user:${idToAdd}:friends`), "new_friend", "");

    //as post req not cached it's safe to use the db instance
    await db.sadd(`user:${session.user.id}:friends`, idToAdd);
    await db.sadd(`user:${idToAdd}:friends`, session.user.id);

    // await db.srem(`user:${idToAdd}:outbound_friend_requests`, session.user.id); //TODO:functionality where we track our sent requests isn't yet implemented where we can use it

    await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd);

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) return new Response("Invalid request payload", { status: 422 });
    return new Response(error as string, { status: 500 });
  }
}
