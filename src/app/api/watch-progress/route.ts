import { NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";
import { getUser } from "@/lib/appwrite/server";
import { createAdminClient } from "@/lib/appwrite/server";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_WATCH_PROGRESS_COLLECTION_ID,
} from "@/lib/appwrite/config";

export async function GET(request: Request) {
  const currentUser = await getUser();
  if (!currentUser) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");

  const { databases } = createAdminClient();

  const queries = [
    Query.equal("user_id", currentUser.$id),
    Query.limit(500),
  ];
  if (videoId) {
    queries.push(Query.equal("video_id", videoId));
  }

  const res = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_WATCH_PROGRESS_COLLECTION_ID,
    queries
  );

  const progress = res.documents.map((d) => ({
    video_id: d.video_id,
    watched: d.watched,
    watched_at: d.watched_at,
    progress: d.progress || 0,
  }));

  return NextResponse.json({ progress });
}

export async function POST(request: Request) {
  const currentUser = await getUser();
  if (!currentUser) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const body = await request.json();
  const { videoId, watched, progress } = body;

  if (!videoId) {
    return NextResponse.json({ error: "videoIdは必須です" }, { status: 400 });
  }

  const { databases } = createAdminClient();

  // 既存のレコードを検索
  const existing = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_WATCH_PROGRESS_COLLECTION_ID,
    [
      Query.equal("user_id", currentUser.$id),
      Query.equal("video_id", videoId),
      Query.limit(1),
    ]
  );

  // progress指定の場合（自動トラッキング）
  if (typeof progress === "number") {
    const autoWatched = progress >= 90;
    const updateData: Record<string, unknown> = { progress };
    if (autoWatched) {
      updateData.watched = true;
      updateData.watched_at = new Date().toISOString();
    }

    if (existing.documents.length > 0) {
      const doc = existing.documents[0];
      // 既に視聴済みの場合はwatchedを上書きしない
      if (doc.watched) {
        delete updateData.watched;
        delete updateData.watched_at;
      }
      // 既存のprogressより大きい場合のみ更新
      if ((doc.progress || 0) < progress) {
        await databases.updateDocument(
          APPWRITE_DATABASE_ID,
          APPWRITE_WATCH_PROGRESS_COLLECTION_ID,
          doc.$id,
          updateData
        );
      }
    } else {
      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_WATCH_PROGRESS_COLLECTION_ID,
        ID.unique(),
        {
          user_id: currentUser.$id,
          video_id: videoId,
          watched: autoWatched,
          watched_at: autoWatched ? new Date().toISOString() : null,
          progress,
        }
      );
    }

    return NextResponse.json({ success: true, autoWatched });
  }

  // watched指定の場合（旧来の手動切り替え、後方互換）
  if (typeof watched === "boolean") {
    if (existing.documents.length > 0) {
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_WATCH_PROGRESS_COLLECTION_ID,
        existing.documents[0].$id,
        {
          watched,
          watched_at: watched ? new Date().toISOString() : null,
        }
      );
    } else {
      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_WATCH_PROGRESS_COLLECTION_ID,
        ID.unique(),
        {
          user_id: currentUser.$id,
          video_id: videoId,
          watched,
          watched_at: watched ? new Date().toISOString() : null,
          progress: 0,
        }
      );
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "progressまたはwatchedは必須です" }, { status: 400 });
}
