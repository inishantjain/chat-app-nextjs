"use client";
import { cn, toPusherKey } from "@/lib/utils";
import { Message } from "@/lib/validations/message";
import { FC, useEffect, useState } from "react";
import { format } from "date-fns";
import Image from "next/image";
import { pusherClient } from "@/lib/pusher";

interface MessagesProps {
  initialMessages: Message[];
  sessionId: string;
  sessionImg: string | null | undefined;
  chatPartner: User;
  chatId: string;
}

const Messages: FC<MessagesProps> = ({ initialMessages, sessionId, sessionImg, chatPartner, chatId }) => {
  // const scrollDownRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  function formatTimeStamp(timestamp: number) {
    return format(timestamp, "HH:mm");
  }

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`chat:${chatId}`));
    const messageHandler = (message: Message) => {
      setMessages((prev) => [message, ...prev]);
    };
    pusherClient.bind("incoming-message", messageHandler);
    return () => {
      pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`));
      pusherClient.unbind("incoming-message", messageHandler);
    };
  }, [chatId]);

  return (
    <div
      id="messages"
      className="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
    >
      {/* <div ref={scrollDownRef} /> */}

      {messages.map((msg, idx) => {
        const isCurrentUser = msg.senderId === sessionId;
        const hasNextMsgFromSameUser = messages[idx - 1]?.senderId === messages[idx].senderId;

        //One Chat Message
        return (
          <div className="chat-message" key={`${msg.id}-${msg.timestamp}`}>
            <div className={cn("flex items-end", { "justify-end": isCurrentUser })}>
              <div
                className={cn("flex flex-col gap-y-2 text-base max-w-xs mx-2", {
                  "order-1 items-end": isCurrentUser,
                  "order-2 items-start": !isCurrentUser,
                })}
              >
                <span
                  className={cn("px-4 py-2 rounded-lg inline-block", {
                    "bg-indigo-600 text-white": isCurrentUser,
                    "bg-gray-200 text-gray-900": !isCurrentUser,
                    "rounded-br-none": !hasNextMsgFromSameUser && isCurrentUser,
                    "rounded-bl-none": !hasNextMsgFromSameUser && !isCurrentUser,
                  })}
                >
                  {msg.text}&nbsp;
                  <span className="ml-2 text-xs text-gray-400">{formatTimeStamp(msg.timestamp)}</span>
                </span>
              </div>
              <div
                className={cn("relative w-6 h-6", {
                  "order-2": isCurrentUser,
                  "order-1": !isCurrentUser,
                  invisible: hasNextMsgFromSameUser, //if its not the last message then it's invisible
                })}
              >
                <Image
                  fill
                  src={isCurrentUser ? (sessionImg as string) : chatPartner.image}
                  alt="Profile Picture"
                  referrerPolicy="no-referrer"
                  className="rounded-full"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Messages;
