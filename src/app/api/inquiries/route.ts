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

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const db = adminDb();
  const snapshot = await db
    .collection("inquiries")
    .where("userId", "==", user.uid)
    .orderBy("createdAt", "desc")
    .get();

  const inquiries = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  return NextResponse.json({ inquiries });
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const body = await request.json();
  const { subject, message } = body;

  if (!subject || !message) {
    return NextResponse.json({ error: "件名とメッセージは必須です" }, { status: 400 });
  }

  const db = adminDb();
  const ref = db.collection("inquiries").doc();
  await ref.set({
    userId: user.uid,
    userEmail: user.email ?? "",
    subject,
    message,
    status: "open",
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, id: ref.id });
}
