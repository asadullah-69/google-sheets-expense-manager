import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Validate required environment variables
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  const missingVars = [
    !googleClientId && "GOOGLE_CLIENT_ID",
if (
  !process.env.GOOGLE_CLIENT_ID ||
  !process.env.GOOGLE_CLIENT_SECRET ||
  !process.env.NEXTAUTH_SECRET
) {
  throw new Error("Missing required authentication environment variables");
}  ].filter(Boolean);
  
  throw new Error(
    `Missing required environment variables: ${missingVars.join(", ")}. ` +
    "Please check your .env file and make sure these variables are set."
  );
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
