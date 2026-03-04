import { NextResponse } from "next/server";
import { ID } from "node-appwrite";
import { getUser, getUserRole, createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_DATABASE_ID, APPWRITE_VIDEOS_COLLECTION_ID } from "@/lib/appwrite/config";

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const role = await getUserRole(user.$id);
  if (role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const body = await request.json();
  const { databases } = createAdminClient();

  const doc = await databases.createDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_VIDEOS_COLLECTION_ID,
    ID.unique(),
    {
      title: body.title,
      youtube_url: body.youtube_url,
      level: body.level,
      description: body.description || "",
      sort_order: body.sort_order || 0,
      created_by: user.$id,
    }
  );

  return NextResponse.json({ success: true, id: doc.$id });
}
