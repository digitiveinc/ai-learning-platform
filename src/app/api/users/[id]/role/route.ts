import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

async function getAuthUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;
  if (!session) return null;
  try {
    return await adminAuth().verifySessionCookie(session, true);
  } catch { return null; }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { id } = await params;
  const db = adminDb();
  const doc = await db.collection("users").doc(id).get();

  if (!doc.exists) {
    return NextResponse.json({ error: "見つかりません" }, { status: 404 });
  }

  const data = doc.data()!;
  return NextResponse.json({ role: data.role ?? "user" });
}
