import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionClient } from "@/lib/appwrite/server";

export async function POST() {
  try {
    const sessionClient = await createSessionClient();
    if (sessionClient) {
      await sessionClient.account.deleteSession("current");
    }
  } catch {
    // セッションが無効でもOK
  }

  const cookieStore = await cookies();
  cookieStore.set("appwrite-session", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return NextResponse.json({ success: true });
}
