import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { getDrive } from "@/lib/google";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 🔒 Make sure user is authenticated and accessToken exists
    const accessToken = (session as any)?.accessToken;
    if (!session || !accessToken) {
      console.warn(
        "⚠️ Unauthorized request — no valid session or access token"
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get spreadsheet name from request body
    const { name } = await req.json();
    const spreadsheetName = name?.trim() || "My New Sheet";

    // Initialize Google Drive with user's access token
    const drive = getDrive(accessToken);

    // Create new spreadsheet
    const file = await drive.files.create({
      requestBody: {
        name: spreadsheetName,
        mimeType: "application/vnd.google-apps.spreadsheet",
      },
      fields: "id, name, webViewLink",
    });

    console.log(`✅ Spreadsheet created: ${file.data.name} (${file.data.id})`);

    return NextResponse.json({
      id: file.data.id,
      name: file.data.name,
      url: file.data.webViewLink,
      message: "Spreadsheet created successfully",
    });
  } catch (err: any) {
    console.error("❌ Error creating spreadsheet:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create spreadsheet" },
      { status: 500 }
    );
  }
}
