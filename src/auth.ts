import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getSheets } from "@/lib/google";

async function refreshAccessToken(token: any) {
  try {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
    });

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    const expiresInSec =
      typeof refreshedTokens.expires_in === "number"
        ? refreshedTokens.expires_in
        : parseInt(String(refreshedTokens.expires_in || "0"), 10) || 0;

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + expiresInSec * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope:
            "openid email profile https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        const expiresInSec =
          typeof account.expires_in === "number"
            ? account.expires_in
            : parseInt(String(account.expires_in || "0"), 10) || 0;
        return {
          ...token,
          accessToken: account.access_token,
          accessTokenExpires: Date.now() + expiresInSec * 1000,
          refreshToken: account.refresh_token,
          idToken: account.id_token,
        };
      }
      const accessTokenExpires = Number((token as any).accessTokenExpires) || 0;
      if (
        (token as any).accessToken &&
        accessTokenExpires &&
        Date.now() < accessTokenExpires
      ) {
        return token;
      }
      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      (session as any).accessToken = (token as any).accessToken;
      (session as any).idToken = (token as any).idToken;
      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      try {
        const sheetId = process.env.LOG_SHEET_ID;
        const range = process.env.LOG_SHEET_RANGE || "Sheet1!A:E";
        const accessToken = account?.access_token as string | undefined;
        if (!sheetId) {
          console.warn("LOG_SHEET_ID not set; skipping login logging");
          return;
        }
        if (!accessToken) {
          console.warn(
            "No access token on signIn event; skipping login logging"
          );
          return;
        }
        const sheets = getSheets(accessToken);
        const nowIso = new Date().toISOString();
        await sheets.spreadsheets.values.append({
          spreadsheetId: sheetId,
          range,
          valueInputOption: "RAW",
          requestBody: {
            values: [
              [
                nowIso,
                user.email ?? "",
                user.name ?? "",
                account?.provider ?? "google",
                "login",
              ],
            ],
          },
        });
      } catch (e) {
        console.error("Failed to append login row:", e);
      }
    },
  },
};
