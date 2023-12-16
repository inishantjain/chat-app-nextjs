import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import Link from "next/link";
import { Icons } from "@/components/Icons";
import Image from "next/image";
import SignOutButton from "@/app/(dashboard)/dashboard/SignOutButton";
import FriendRequestSidebarOptions from "@/app/(dashboard)/dashboard/FriendRequestSidebarOption";
import { fetchRedis } from "@/helpers/redis";
import SidebarChatList from "@/app/(dashboard)/dashboard/SidebarChatList";
import MobileChatLayout from "@/app/(dashboard)/dashboard/MobileChatLayout";
import { SideBarOption } from "@/types/typings";
import { Metadata } from "next";
import { db } from "@/lib/db";

interface LayoutProps {
  children: ReactNode;
}

const sideBarOptions: SideBarOption[] = [
  {
    id: 1,
    name: "Add Friend",
    href: "/dashboard/add",
    Icon: "UserPlus",
  },
  {
    id: 2,
    name: "My Friends",
    href: "/dashboard/myfriends",
    Icon: "Users",
  },
  {
    id: 3,
    name: "Add Friend",
    href: "/dashboard/add",
    Icon: "UserPlus",
  },
];

async function getChatsByUserId(userId: string) {
  const chatIds = await db.keys(`chat:*${userId}*:messages`);
  const chats = (await Promise.all(
    chatIds.map(async (chatId) => {
      // chat:userId1--userId2:messages -> retrieving the chatPartnerId
      const [userId1, userId2] = chatId.slice(5, -9).split("--");
      const chatPartnerId = userId1 === userId ? userId2 : userId1;
      return await db.get(`user:${chatPartnerId}`);
    })
  )) as User[] | [];
  return chats;
}

export const metadata: Metadata = {
  title: "Dashboard",
  description: "A next js chat application",
};

async function Layout({ children }: LayoutProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const chatPartnerList = await getChatsByUserId(session.user.id);

  const unseenRequestCount = (
    (await fetchRedis("smembers", `user:${session.user.id}:incoming_friend_requests`)) as User[]
  ).length;

  return (
    <div className="w-full flex h-screen">
      <div className="md:hidden">
        <MobileChatLayout
          chatPartnerList={chatPartnerList}
          session={session}
          sidebarOptions={sideBarOptions}
          unseenRequestCount={unseenRequestCount}
        />
      </div>
      <div className="hidden md:flex h-full w-full max-w-xs grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
        <Link href="/dashboard" className="mt-4 flex items-center w-fit">
          <Icons.LogoMonkey />
        </Link>

        {chatPartnerList.length > 0 && <div className="text-xs font-semibold leading-6 text-gray-400">Your chats</div>}

        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <SidebarChatList chatPartners={chatPartnerList} sessionId={session.user.id} />

            <li>
              <div className="text-xs font-semibold leading-6 text-gray-400">Overview</div>
            </li>
            {/* sidebar Options */}
            <li>
              <ul role="list" className="-mx-2 mt-2 space-y-1">
                {sideBarOptions.map((option) => {
                  const Icon = Icons[option.Icon];
                  return (
                    <li key={option.id}>
                      <Link
                        href={option.href}
                        className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold"
                      >
                        <span className="text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="truncate">{option.name}</span>
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <FriendRequestSidebarOptions
                    sessionId={session.user.id}
                    initialUnseenRequestCount={unseenRequestCount}
                  />
                </li>
              </ul>
            </li>

            <li className="-mx-6 mt-auto flex items-center">
              <div className="flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900">
                <div className="relative h-8 w-8 bg-gray-50">
                  <Image
                    fill
                    referrerPolicy="no-referrer"
                    className="rounded-full"
                    src={session.user.image || ""}
                    alt="Your Profile Picture"
                  />
                </div>
                {/* Nobody except screen readers can see the below text (for visually impaired one's) */}
                <div className="sr-only">Your Profile</div>
                <div className="flex flex-col">
                  <span aria-hidden="true">{session.user.name}</span>
                  <span className="text-xs text-zinc-400" area-hidden="true">
                    {session.user.name}
                  </span>
                </div>
              </div>
              <SignOutButton className="h-full aspect-square " />
            </li>
          </ul>
        </nav>
      </div>
      <aside className="max-h-screen container pt-11 md:pt-4 pb-4">{children}</aside>
    </div>
  );
}

export default Layout;
