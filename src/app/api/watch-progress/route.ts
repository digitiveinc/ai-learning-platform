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
  }));

  return NextResponse.json({ progress });
}

export async function POST(request: Request) {
  const currentUser = await getUser();
  if (!currentUser) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { videoId, watched } = await request.json();

  if (!videoId || typeof watched !== "boolean") {
    return NextResponse.json({ error: "videoIdとwatchedは必須です" }, { status: 400 });
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

  if (existing.documents.length > 0) {
    // 更新
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
    // 新規作成
    await databases.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_WATCH_PROGRESS_COLLECTION_ID,
      ID.unique(),
      {
        user_id: currentUser.$id,
        video_id: videoId,
        watched,
        watched_at: watched ? new Date().toISOString() : null,
      }
    );
  }

  return NextResponse.json({ success: true });
}
