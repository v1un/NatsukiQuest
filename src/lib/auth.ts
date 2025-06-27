import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Discord({
        clientId: process.env.AUTH_DISCORD_ID,
        clientSecret: process.env.AUTH_DISCORD_SECRET,
    })
  ],
  secret: process.env.AUTH_SECRET,
  trustHost: process.env.AUTH_TRUST_HOST === "true",
  callbacks: {
    session({ session, user }) {
        if (session.user) {
            session.user.id = user.id;
        }
        return session;
    }
  }
})
