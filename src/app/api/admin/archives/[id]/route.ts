import { NextResponse } from "next/server";
import { createAdminClient, getUser, getUserRole, getUserCompanyId } from "@/lib/appwrite/server";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_ARCHIVES_COLLECTION_ID,
} from "@/lib/appwrite/config";

async function requireAdminApi() {
  const currentUser = await getUser();
  if (!currentUser) {
    return { error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }) };
  }
  const role = await getUserRole(currentUser.$id);
  if (role !== "admin" && role !== "superadmin") {
    return { error: NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 }) };
  }
  const companyId = await getUserCompanyId(currentUser.$id);
  return { currentUser, role, companyId };
}

async function checkArchiveScope(archive: { target_type: string; target_id: string }, adminRole: string, adminCompanyId?: string) {
  if (adminRole === "superadmin") return true;
  if (archive.target_type === "company") {
    return archive.target_id === adminCompanyId;
  }
  // ユーザー向けの場合、対象ユーザーが自社所属か確認
  const targetCompanyId = await getUserCompanyId(archive.target_id);
  return targetCompanyId === adminCompanyId;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if ("error" in auth && auth.error) return auth.error;
  if (!APPWRITE_ARCHIVES_COLLECTION_ID) {
    return NextResponse.json({ error: "アーカイブ機能は現在無効です" }, { status: 503 });
  }

  const { id } = await params;

  try {
    const { databases } = createAdminClient();

    // 既存アーカイブを取得
    const existing = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_ARCHIVES_COLLECTION_ID,
      id
    );

    // スコープ検証
    if (!await checkArchiveScope(existing as unknown as { target_type: string; target_id: string }, auth.role!, auth.companyId)) {
      return NextResponse.json({ error: "このアーカイブを編集する権限がありません" }, { status: 403 });
    }

    const { title, description, youtube_url, target_type, target_id } = await request.json();

    // 更新先のスコープも検証
    if (target_type && target_id) {
      if (!await checkArchiveScope({ target_type, target_id }, auth.role!, auth.companyId)) {
        return NextResponse.json({ error: "指定された対象への変更権限がありません" }, { status: 403 });
      }
    }

    const updateData: Record<string, string> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (youtube_url !== undefined) updateData.youtube_url = youtube_url;
    if (target_type !== undefined) updateData.target_type = target_type;
    if (target_id !== undefined) updateData.target_id = target_id;

    await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_ARCHIVES_COLLECTION_ID,
      id,
      updateData
    );

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "更新に失敗しました";
    console.error("Update archive error:", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if ("error" in auth && auth.error) return auth.error;
  if (!APPWRITE_ARCHIVES_COLLECTION_ID) {
    return NextResponse.json({ error: "アーカイブ機能は現在無効です" }, { status: 503 });
  }

  const { id } = await params;

  try {
    const { databases } = createAdminClient();

    const existing = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_ARCHIVES_COLLECTION_ID,
      id
    );

    if (!await checkArchiveScope(existing as unknown as { target_type: string; target_id: string }, auth.role!, auth.companyId)) {
      return NextResponse.json({ error: "このアーカイブを削除する権限がありません" }, { status: 403 });
    }

    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_ARCHIVES_COLLECTION_ID,
      id
    );

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "削除に失敗しました";
    console.error("Delete archive error:", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
