import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/auth";
import { getSheets } from "@/lib/google";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !(session as any).accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { spreadsheetId, date, description, category, amount } =
      await req.json();
    if (!spreadsheetId || !description || !amount) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const sheets = getSheets((session as any).accessToken as string);

    const range = "sheet1!A:D"; // Adjust as needed
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: {
        values: [[date || "", description, category || "", String(amount)]],
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error adding row:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown Error" },
      { status: 500 }
    );
  }
}
