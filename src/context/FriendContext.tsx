// "use client";
// import { authOptions } from "@/app/api/auth/[...nextauth]/options";
// import { getFriendsByUserId } from "@/helpers/get-friends-by-user-id";
// import { getServerSession } from "next-auth";
// import { redirect } from "next/navigation";
// import { ReactNode, createContext, useContext, FC } from "react";

// const FriendContext = createContext<User[]>([]);

// interface FriendsProviderProps {
//   children: ReactNode;
// }

// export const FriendsProvider: FC<FriendsProviderProps> = async ({ children }) => {
//   console.log("Hii for Friends");
//   const session = await getServerSession(authOptions);
//   if (!session) redirect("/login");
//   const friends = await getFriendsByUserId(session.user.id);
//   return <FriendContext.Provider value={friends}>{children}</FriendContext.Provider>;
// };

// export function useFriendsContext() {
//   return useContext(FriendContext);
// }
