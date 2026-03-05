import { NextResponse } from "next/server";
import { Query } from "node-appwrite";
import { createAdminClient, getUser, getUserRole } from "@/lib/appwrite/server";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_USER_SETTINGS_COLLECTION_ID,
  APPWRITE_WATCH_PROGRESS_COLLECTION_ID,
} from "@/lib/appwrite/config";

async function requireAdminApi() {
  const currentUser = await getUser();
  if (!currentUser) {
    return { error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }) };
  }
  const role = await getUserRole(currentUser.$id);
  if (role !== "admin") {
    return { error: NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 }) };
  }
  return { currentUser };
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if ("error" in auth && auth.error) return auth.error;

  const { id } = await params;
  const { displayName, level, accessMode, password, role } = await request.json();

  try {
    const { users, databases } = createAdminClient();

    // レベル・ロール更新
    if (level || role) {
      const user = await users.get(id);
      const currentLabels = user.labels || [];
      let newLabels = currentLabels.filter(
        (l: string) => !["beginner", "intermediate", "advanced"].includes(l)
      );
      if (level) newLabels.push(level);
      if (role === "admin" && !newLabels.includes("admin")) newLabels.push("admin");
      if (role === "user") newLabels = newLabels.filter((l: string) => l !== "admin");
      await users.updateLabels(id, newLabels);
    }

    // パスワード更新
    if (password) {
      await users.updatePassword(id, password);
    }

    // user_settings 更新
    const settingsRes = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_USER_SETTINGS_COLLECTION_ID,
      [Query.equal("user_id", id), Query.limit(1)]
    );

    if (settingsRes.documents.length > 0) {
      const doc = settingsRes.documents[0];
      const updateData: Record<string, string> = {};
      if (displayName !== undefined) updateData.display_name = displayName;
      if (accessMode) updateData.access_mode = accessMode;
      if (Object.keys(updateData).length > 0) {
        await databases.updateDocument(
          APPWRITE_DATABASE_ID,
          APPWRITE_USER_SETTINGS_COLLECTION_ID,
          doc.$id,
          updateData
        );
      }
    }

    // 名前更新
    if (displayName !== undefined) {
      await users.updateName(id, displayName);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "更新に失敗しました";
    console.error("Update user error:", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if ("error" in auth && auth.error) return auth.error;

  const { id } = await params;

  try {
    const { users, databases } = createAdminClient();

    // user_settings 削除
    const settingsRes = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_USER_SETTINGS_COLLECTION_ID,
      [Query.equal("user_id", id), Query.limit(1)]
    );
    for (const doc of settingsRes.documents) {
      await databases.deleteDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_USER_SETTINGS_COLLECTION_ID,
        doc.$id
      );
    }

    // watch_progress 削除
    const progressRes = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_WATCH_PROGRESS_COLLECTION_ID,
      [Query.equal("user_id", id), Query.limit(500)]
    );
    for (const doc of progressRes.documents) {
      await databases.deleteDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_WATCH_PROGRESS_COLLECTION_ID,
        doc.$id
      );
    }

    // ユーザー削除
    await users.delete(id);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "削除に失敗しました";
    console.error("Delete user error:", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
