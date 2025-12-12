import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true },
      });

      if (session.user) {
        session.user.id = user.id;
        session.user.role = dbUser?.role || "USER";
      }

      return session;
    },
    async signIn({ user, account, profile }) {
      // Admin emails list - add your GitHub email here
      const adminEmails = [
        "admin@yellowbooks.mn",
        "ach.erdene360@gmail.com", // Add your GitHub email
      ];
      
      if (user.email && adminEmails.includes(user.email)) {
        await prisma.user.update({
          where: { email: user.email },
          data: { role: "ADMIN" },
        });
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "database",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
