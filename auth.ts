import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { getUserRepository } from "@/src/infrastructure/repositories/user-repository";

interface VerifiedGoogleProfile {
  subject: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

function parseVerifiedGoogleProfile(
  profile: Record<string, unknown> | undefined,
): VerifiedGoogleProfile | null {
  if (!profile) {
    return null;
  }

  const subject = profile.sub;
  const email = profile.email;
  const name = profile.name;
  const picture = profile.picture;
  const emailVerified = profile.email_verified;

  if (
    typeof subject !== "string" ||
    typeof email !== "string" ||
    emailVerified !== true
  ) {
    return null;
  }

  return {
    subject,
    email,
    name: typeof name === "string" && name.trim() ? name : email,
    avatarUrl: typeof picture === "string" ? picture : null,
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [Google],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") {
        return false;
      }

      return Boolean(
        parseVerifiedGoogleProfile(
          profile as Record<string, unknown> | undefined,
        ),
      );
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === "google") {
        const googleProfile = parseVerifiedGoogleProfile(
          profile as Record<string, unknown> | undefined,
        );

        if (!googleProfile) {
          throw new Error("Google account does not provide a verified email");
        }

        const user = await getUserRepository().upsertGoogleUser({
          googleSubject: googleProfile.subject,
          email: googleProfile.email,
          name: googleProfile.name,
          avatarUrl: googleProfile.avatarUrl,
          timezone: "Asia/Jakarta",
        });

        token.userId = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.userId === "string") {
        session.user.id = token.userId;
      }

      return session;
    },
    authorized({ auth: session, request }) {
      if (request.nextUrl.pathname.startsWith("/dashboard")) {
        return Boolean(session?.user?.id);
      }

      return true;
    },
  },
});
