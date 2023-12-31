import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import FriendRequests from "@/app/(dashboard)/dashboard/requests/FriendRequests";
import { fetchRedis } from "@/helpers/redis";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

async function Requests() {
  const session = await getServerSession(authOptions);

  if (!session) notFound();

  const incomingSenderIds = (await fetchRedis(
    "smembers",
    `user:${session.user.id}:incoming_friend_requests`
  )) as string[];

  const incomingFriendRequests = await Promise.all(
    incomingSenderIds.map(async (senderId) => {
      const sender = (await fetchRedis("get", `user:${senderId}`)) as string;
      const senderParsed = JSON.parse(sender) as User;
      return { senderId, senderEmail: senderParsed.email };
    })
  );

  return (
    <main className="pt-8">
      <h1 className="font-bold text-4xl md:text-5xl mb-8">Friend Requests</h1>
      <div className="flex flex-col gap-4">
        <FriendRequests incomingFriendRequests={incomingFriendRequests} />
      </div>
    </main>
  );
}

export default Requests;
