import { NextAuthOptions } from "next-auth";
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import { db } from "@/lib/db";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { fetchRedis } from "@/helpers/redis";

function getGoogleCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId) throw new Error("Missing GOOGLE_CLIENT_ID");
  if (!clientSecret) throw new Error("Missing GOOGLE_CLIENT_SECRET");
  return { clientId, clientSecret };
}

function getFacebookCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.FACEBOOK_CLIENT_ID;
  const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
  if (!clientId) throw new Error("Missing FACEBOOK_CLIENT_ID");
  if (!clientSecret) throw new Error("Missing FACEBOOK_CLIENT_SECRET");
  return { clientId, clientSecret };
}

export const authOptions: NextAuthOptions = {
  adapter: UpstashRedisAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [GoogleProvider(getGoogleCredentials()), FacebookProvider(getFacebookCredentials())],
  callbacks: {
    //FIXME: error when secret changed, error when entry removed from db
    async jwt({ token, user }) {
      const dbUser = (await db.get(`user:${token.id}`)) as User | null;
      if (!dbUser) {
        token.id = user!.id;
        return token;
      }

      /*  if above snippet doesn't work us this      
         const dbUserResult = (await fetchRedis("get", `user:${token.id}`)) as string | null;
      if (!dbUserResult) {
        token.id = user!.id;
        return token;
      }
      const dbUser = JSON.parse(dbUserResult) as User; */

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
      };
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      return session;
    },
    redirect() {
      return "/dashboard";
    },
  },
};
