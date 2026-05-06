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

  const role = user.role as string | undefined;
  if (role !== "admin" && role !== "superadmin") {
    return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  }

  const { id } = await params;
  const db = adminDb();
  const doc = await db.collection("archives").doc(id).get();

  if (!doc.exists) {
    return NextResponse.json({ error: "見つかりません" }, { status: 404 });
  }

  return NextResponse.json({ id: doc.id, ...doc.data() });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const role = user.role as string | undefined;
  if (role !== "admin" && role !== "superadmin") {
    return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { title, youtubeId, description, thumbnailUrl } = body;

  const db = adminDb();
  await db.collection("archives").doc(id).update({
    ...(title !== undefined && { title }),
    ...(youtubeId !== undefined && { youtubeId }),
    ...(description !== undefined && { description }),
    ...(thumbnailUrl !== undefined && { thumbnailUrl }),
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const role = user.role as string | undefined;
  if (role !== "admin" && role !== "superadmin") {
    return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  }

  const { id } = await params;
  const db = adminDb();
  await db.collection("archives").doc(id).delete();

  return NextResponse.json({ success: true });
}
