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
  const doc = await db.collection("userProgress").doc(user.uid).get();
  const data = doc.data();

  return NextResponse.json({ watched: data?.watched ?? {} });
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const body = await request.json();
  const { videoId, watched, progress } = body;

  if (!videoId) {
    return NextResponse.json({ error: "videoIdは必須です" }, { status: 400 });
  }

  const db = adminDb();
  const docRef = db.collection("userProgress").doc(user.uid);

  // 既存データを取得して現在の watched 状態を確認
  const existing = await docRef.get();
  const existingData = existing.data();
  const currentEntry = existingData?.watched?.[videoId] as { watched?: boolean; progress?: number; watchedAt?: string } | undefined;

  if (typeof progress === "number") {
    const autoWatched = progress >= 90;
    const alreadyWatched = currentEntry?.watched === true;

    // 既存 progress より大きい場合のみ更新
    const currentProgress = currentEntry?.progress ?? 0;
    if (currentProgress >= progress && !autoWatched) {
      return NextResponse.json({ success: true, autoWatched: false });
    }

    const entry: Record<string, unknown> = { progress };

    if (autoWatched && !alreadyWatched) {
      entry.watched = true;
      entry.watchedAt = new Date().toISOString();
    } else if (alreadyWatched) {
      // 既に視聴済みの場合は watched/watchedAt を保持
      entry.watched = true;
      entry.watchedAt = currentEntry?.watchedAt ?? new Date().toISOString();
    }

    await docRef.set(
      { watched: { [videoId]: entry } },
      { merge: true }
    );

    return NextResponse.json({ success: true, autoWatched: autoWatched && !alreadyWatched });
  }

  if (typeof watched === "boolean") {
    const alreadyWatched = currentEntry?.watched === true;
    const entry: Record<string, unknown> = {
      watched,
      watchedAt: watched ? new Date().toISOString() : null,
      progress: currentEntry?.progress ?? 0,
    };

    // 既に watched = true の場合は上書きしない（progress のみ更新）
    if (alreadyWatched && !watched) {
      return NextResponse.json({ success: true });
    }

    await docRef.set(
      { watched: { [videoId]: entry } },
      { merge: true }
    );

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "progressまたはwatchedは必須です" }, { status: 400 });
}
