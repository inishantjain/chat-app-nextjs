import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { fetchRedis } from "@/helpers/redis";
import { db } from "@/lib/db";
import { messageArrayValidator } from "@/lib/validations/message";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Image from "next/image";
import Messages from "@/app/(dashboard)/dashboard/chat/[chatId]/Messages";
import ChatInput from "@/app/(dashboard)/dashboard/chat/[chatId]/ChatInput";

interface PageProps {
  params: {
    chatId: string;
  };
}

async function getChatMessages(chatId: string) {
  try {
    const results: string[] = await fetchRedis("zrange", `chat:${chatId}:messages`, 0, -1);
    const dbMessages = results.map((message) => JSON.parse(message) as Message);
    const reversedDbMessages = dbMessages.reverse();
    const messages = messageArrayValidator.parse(reversedDbMessages);
    return messages;
  } catch (error) {
    console.error("Error in chat page component", error);
    notFound();
  }
}

async function Chat({ params }: PageProps) {
  const { chatId } = params;
  const session = await getServerSession(authOptions);
  if (!session) notFound();
  const { user } = session;

  const [userId1, userId2] = chatId.split("--");

  if (user.id !== userId1 && user.id !== userId2) {
    // console.error("UserId does not match to ids in url");
    notFound();
  }

  const chatPartnerId = user.id === userId1 ? userId2 : userId1;
  const isPartnerFriend = (await db.sismember(`user:${userId1}:friends`, userId2)) === 1 ? true : false;
  const chatPartner = (await db.get(`user:${chatPartnerId}`)) as User;
  const initialMessages = await getChatMessages(chatId);

  return (
    <div className="flex-1 justify-between flex flex-col h-full">
      <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
        <div className="relative flex items-center space-x-4">
          <div className="relative">
            <div className="relative w-8 sm:w-12 h-8 sm:h-12">
              <Image
                fill
                referrerPolicy="no-referrer"
                src={chatPartner.image}
                alt={`${chatPartner.name} profile picture`}
                className="rounded-full"
              />
            </div>
          </div>

          <div className="flex flex-col leading-tight">
            <div className="text-xl flex items-center">
              <span className="text-gray-700 mr-3 font-semibold">{chatPartner.name}</span>
            </div>

            <span className="text-sm text-gray-600">{chatPartner.email}</span>
          </div>
        </div>
      </div>

      <Messages
        initialMessages={initialMessages}
        sessionId={session.user.id}
        chatPartner={chatPartner}
        sessionImg={session.user.image}
        chatId={chatId}
      />
      {isPartnerFriend ? (
        <ChatInput chatPartner={chatPartner} chatId={chatId} />
      ) : (
        <p className="text-center p-6 text-sm text-zinc-500">You are not friend with {chatPartner.name}</p>
      )}
    </div>
  );
}

export default Chat;
