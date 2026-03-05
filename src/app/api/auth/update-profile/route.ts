import { NextResponse } from "next/server";
import { Query } from "node-appwrite";
import { createSessionClient, createAdminClient } from "@/lib/appwrite/server";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_USER_SETTINGS_COLLECTION_ID,
} from "@/lib/appwrite/config";

export async function POST(request: Request) {
  const sessionClient = await createSessionClient();
  if (!sessionClient) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const user = await sessionClient.account.get();
  const { displayName } = await request.json();

  if (!displayName || typeof displayName !== "string") {
    return NextResponse.json(
      { error: "表示名は必須です" },
      { status: 400 }
    );
  }

  const trimmed = displayName.trim();
  if (trimmed.length === 0 || trimmed.length > 50) {
    return NextResponse.json(
      { error: "表示名は1〜50文字で入力してください" },
      { status: 400 }
    );
  }

  try {
    const { databases, users } = createAdminClient();

    // Appwrite ユーザー名を更新
    await users.updateName(user.$id, trimmed);

    // user_settings の display_name を更新
    const settingsRes = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_USER_SETTINGS_COLLECTION_ID,
      [Query.equal("user_id", user.$id), Query.limit(1)]
    );

    if (settingsRes.documents.length > 0) {
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_USER_SETTINGS_COLLECTION_ID,
        settingsRes.documents[0].$id,
        { display_name: trimmed }
      );
    }

    return NextResponse.json({ success: true, displayName: trimmed });
  } catch (err: unknown) {
    console.error("Update profile error:", err);
    return NextResponse.json(
      { error: "表示名の更新に失敗しました" },
      { status: 500 }
    );
  }
}
