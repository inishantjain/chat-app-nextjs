import FriendsList from "./FriendsList";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getFriendsByUserId } from "@/helpers/get-friends-by-user-id";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

async function MyFriends() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const friends = await getFriendsByUserId(session.user.id);
  return (
    <main className="pt-8">
      <h1 className="font-bold text-4xl md:text-5xl mb-8">My Friends</h1>
      <FriendsList friends={friends} sessionId={session.user.id} />
    </main>
  );
}

export default MyFriends;
