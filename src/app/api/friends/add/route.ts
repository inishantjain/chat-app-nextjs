import { addFriendValidator } from "@/lib/validations/add-friend";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { fetchRedis } from "@/helpers/redis";
import { db } from "@/lib/db";
import { ZodError } from "zod";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email: emailToAdd } = addFriendValidator.parse(body.email);

    /*    const RESTResponse = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/user:email:${emailToAdd}`, {
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
      cache: "no-store",
    });

    const data = (await RESTResponse.json()) as { result: string };

    const idToAdd = data.result; */
    const idToAdd = (await fetchRedis("get", `user:email:${emailToAdd}`)) as string;
    console.log("fetchRedis reponse ", idToAdd);
    const session = await getServerSession(authOptions);

    if (!idToAdd) return new Response("This person does not exist.", { status: 400 });
    if (!session) return new Response("Unauthorized", { status: 401 });
    if (idToAdd === session.user.id) return new Response("You cannot add yourself as a friend.", { status: 400 });

    const isAlreadyAdded = await fetchRedis("sismember", `user:${idToAdd}:incoming_friend_requests`, session.user.id);
    if (isAlreadyAdded) return new Response("This user already added", { status: 400 });

    const isAlreadyFriends = await fetchRedis("sismember", `user:${session.user.id}:friends`, idToAdd);
    if (isAlreadyFriends) return new Response("Already Friends with this user", { status: 400 });

    //valid request, send friend request

    // trigger event on frontend
    await pusherServer.trigger(toPusherKey(`user:${idToAdd}:incoming_friend_requests`), "incoming_friend_requests", {
      senderId: session.user.id,
      senderEmail: session.user.email,
    });

    db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);
    return new Response("OK");
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response("Invalid Request Payload", { status: 422 });
    }
  }
}
