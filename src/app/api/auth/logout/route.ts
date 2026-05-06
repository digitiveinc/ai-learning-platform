import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";

export async function POST() {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;

  if (session) {
    try {
      const decoded = await adminAuth().verifySessionCookie(session);
      await adminAuth().revokeRefreshTokens(decoded.uid);
    } catch {
      // 無効なセッションでも続行
    }
  }

  cookieStore.set("__session", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return NextResponse.json({ success: true });
}
