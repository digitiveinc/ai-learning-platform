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
  const snapshot = await db.collection("videos").orderBy("sortOrder").get();

  const videos = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  return NextResponse.json({ videos });
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const role = user.role as string | undefined;
  if (role !== "admin" && role !== "superadmin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const body = await request.json();
  const { title, youtubeId, description, level, sortOrder } = body;

  if (!title || !youtubeId) {
    return NextResponse.json({ error: "必須項目を入力してください" }, { status: 400 });
  }

  const db = adminDb();
  const ref = db.collection("videos").doc();
  await ref.set({
    title,
    youtubeId,
    description: description || "",
    level: level || "",
    sortOrder: sortOrder ?? 0,
    createdAt: new Date().toISOString(),
    createdBy: user.uid,
  });

  return NextResponse.json({ success: true, id: ref.id });
}
