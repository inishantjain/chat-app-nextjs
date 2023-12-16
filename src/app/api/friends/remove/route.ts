import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import z from "zod";
import { db } from "@/lib/db";

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const idToUnfriend = url.searchParams.get("id");
    console.log(idToUnfriend);
    z.string().parse(idToUnfriend);

    const session = await getServerSession(authOptions);

    if (!session) return new Response("Unauthorized", { status: 401 });

    await Promise.all([
      db.srem(`user:${session.user.id}:friends`, idToUnfriend),
      db.srem(`user:${idToUnfriend}:friends`, session.user.id),
    ]);
    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) return new Response("Invalid request payload", { status: 422 });
    return new Response(error as string, { status: 500 });
  }
}
