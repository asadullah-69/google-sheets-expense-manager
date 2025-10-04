import NextAuth from "next-auth";
import { authOptions } from "@/auth";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (!googleClientId || !googleClientSecret || !nextAuthSecret) {
  console.error("Missing required environment variables for authentication:");
  if (!googleClientId) console.error("→ GOOGLE_CLIENT_ID");
  if (!googleClientSecret) console.error("→ GOOGLE_CLIENT_SECRET");
  if (!nextAuthSecret) console.error("→ NEXTAUTH_SECRET");
  throw new Error(
    "Missing environment variables for Google Auth configuration."
  );
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
