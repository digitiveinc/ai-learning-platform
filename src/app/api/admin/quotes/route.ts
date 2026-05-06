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

  const role = user.role as string | undefined;
  if (role !== "admin" && role !== "superadmin") {
    return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  }

  const db = adminDb();
  const snapshot = await db.collection("quotes").orderBy("publishDate", "desc").get();

  const quotes = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  return NextResponse.json({ quotes });
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const role = user.role as string | undefined;
  if (role !== "admin" && role !== "superadmin") {
    return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  }

  const body = await request.json();
  const { text, author, publishDate } = body;

  if (!text || !author || !publishDate) {
    return NextResponse.json({ error: "必須項目を入力してください" }, { status: 400 });
  }

  // publishDate は YYYY-MM-DD 形式。document ID として使用する
  const db = adminDb();
  await db.collection("quotes").doc(publishDate).set({
    text,
    author,
    publishDate,
    createdAt: new Date().toISOString(),
    createdBy: user.uid,
  });

  return NextResponse.json({ success: true, id: publishDate });
}
