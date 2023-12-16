"use client";
import { chatHrefConstructor } from "@/lib/utils";
import axios from "axios";
import { MessageSquare, UserMinus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { FC } from "react";
import toast from "react-hot-toast";

interface FriendsProps {
  friends: User[];
  sessionId: string;
}

const FriendsList: FC<FriendsProps> = ({ friends: fd, sessionId }) => {
  const [friends, setFriends] = useState(fd);

  async function deleteFriend(friendId: string) {
    try {
      await axios.delete(`/api/friends/remove?id=${friendId}`);
      setFriends((prev) => prev.filter((fd) => fd.id !== friendId));
    } catch (error) {
      console.error("Error deleting friend", error);
      toast.error("Error deleting friend");
    }
  }

  return (
    <>
      {friends.length === 0 && <p className="text-sm text-zinc-500">You have no friends...</p>}
      <ul className="space-y-3 max-w-md">
        {friends.map((friend) => (
          <div key={friend.id} className="flex gap-2 sm:gap-4 items-center w-full">
            {/* <div className=""> */}
            <Image alt="profile picture" src={friend.image} width={28} height={28} className="rounded-full" />
            {/* </div> */}
            <p className="font-medium flex-shrink text-sm sm:text-lg truncate">{friend.email}</p>
            <a
              href={`/dashboard/chat/${chatHrefConstructor(sessionId, friend.id)}`}
              title="chat"
              aria-label="accept friend"
              className="flex-shrink-0 ml-auto w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md"
            >
              <MessageSquare className="font-semibold text-white w-1/2 h-1/2" />
            </a>
            <button
              onClick={() => deleteFriend(friend.id)}
              title="delete friend"
              aria-label="deny friend"
              className="flex-shrink-0 w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md"
            >
              <UserMinus className="font-semibold text-white w-1/2 h-1/2" />
            </button>
          </div>
        ))}
      </ul>
    </>
  );
};

export default FriendsList;
