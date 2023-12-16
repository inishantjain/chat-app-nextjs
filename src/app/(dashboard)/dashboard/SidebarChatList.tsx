"use client";
import { FC, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { chatHrefConstructor, toPusherKey } from "@/lib/utils";
import { pusherClient } from "@/lib/pusher";
import toast from "react-hot-toast";
import UnseenChatToast from "@/components/UnseenChatToast";

interface SidebarChatListProps {
  chatPartners: User[];
  sessionId: string;
}

interface ExtendedMessage extends Message {
  senderImg: string;
  senderName: string;
}

const SidebarChatList: FC<SidebarChatListProps> = ({ chatPartners, sessionId }) => {
  const pathname = usePathname();
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);
  const [activeChats, setActiveChats] = useState<User[]>(chatPartners);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`));

    const chatHandler = (message: ExtendedMessage) => {
      //if its a new chat add it to the chat list
      if (!activeChats.some((chatUser) => chatUser.id === message.senderId))
        setActiveChats((prev) => [
          { id: message.senderId, image: message.senderImg, name: message.senderName, email: "" },
          ...prev,
        ]);
      //if user is away from active chat then push a toast
      const shouldNotify = pathname !== `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`;

      if (!shouldNotify) return;
      //notify when we are on different chat or different screen
      toast.custom((t) => (
        <UnseenChatToast
          t={t}
          sessionId={sessionId}
          senderId={message.senderId}
          senderImg={message.senderImg}
          senderMessage={message.text}
          senderName={message.senderName}
        />
      ));

      setUnseenMessages((prev) => [...prev, message]);
    };

    pusherClient.bind("new_message", chatHandler);

    return () => {
      pusherClient.unbind("new_message", chatHandler);
      pusherClient.unsubscribe(toPusherKey(`users:${sessionId}:chats`));
    };
  }, [pathname, sessionId, activeChats]);

  useEffect(() => {
    //if a chat is already open then it can't have unseen messages
    if (pathname?.includes("chat")) {
      setUnseenMessages((prev) => {
        return prev.filter((msg) => !pathname.includes(msg.senderId));
      });
    }
  }, [pathname]);

  return (
    <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
      {activeChats.sort().map((friend) => {
        const unseenMessagesCount = unseenMessages.filter((unseenMsg) => unseenMsg.senderId === friend.id).length;

        return (
          <li key={friend.id}>
            <a
              href={`/dashboard/chat/${chatHrefConstructor(sessionId, friend.id)}`}
              className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
            >
              {friend.name}
              {unseenMessagesCount > 0 && (
                <div className="bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center">
                  {unseenMessagesCount}
                </div>
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default SidebarChatList;
