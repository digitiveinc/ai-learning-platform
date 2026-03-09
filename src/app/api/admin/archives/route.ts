import { NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";
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

export async function GET() {
  const auth = await requireAdminApi();
  if ("error" in auth && auth.error) return auth.error;
  if (!APPWRITE_ARCHIVES_COLLECTION_ID) {
    return NextResponse.json({ error: "アーカイブ機能は現在無効です" }, { status: 503 });
  }

  try {
    const { databases } = createAdminClient();

    const queries = [Query.orderDesc("created_at"), Query.limit(500)];

    // adminは自社の企業向けアーカイブのみ
    if (auth.role !== "superadmin" && auth.companyId) {
      queries.push(Query.equal("target_type", "company"));
      queries.push(Query.equal("target_id", auth.companyId));
    }

    const res = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_ARCHIVES_COLLECTION_ID,
      queries
    );

    const archives = res.documents.map((d) => ({
      id: d.$id,
      title: d.title,
      description: d.description || "",
      youtube_url: d.youtube_url,
      thumbnail_url: d.thumbnail_url || "",
      target_type: d.target_type,
      target_id: d.target_id,
      created_by: d.created_by,
      created_at: d.created_at,
    }));

    return NextResponse.json({ archives });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "取得に失敗しました";
    console.error("List archives error:", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth && auth.error) return auth.error;
  if (!APPWRITE_ARCHIVES_COLLECTION_ID) {
    return NextResponse.json({ error: "アーカイブ機能は現在無効です" }, { status: 503 });
  }

  const { title, description, youtube_url, thumbnail_url, target_type, target_id } = await request.json();

  if (!title || !youtube_url || !target_type || !target_id) {
    return NextResponse.json({ error: "必須項目を入力してください" }, { status: 400 });
  }

  if (target_type !== "company" && target_type !== "user") {
    return NextResponse.json({ error: "対象種別が不正です" }, { status: 400 });
  }

  // adminは自社の企業IDのみ許可
  if (auth.role !== "superadmin") {
    if (target_type === "company" && target_id !== auth.companyId) {
      return NextResponse.json({ error: "他社へのアーカイブ作成権限がありません" }, { status: 403 });
    }
    if (target_type === "user") {
      // ユーザーが自社所属か確認
      const targetCompanyId = await getUserCompanyId(target_id);
      if (targetCompanyId !== auth.companyId) {
        return NextResponse.json({ error: "他社ユーザーへのアーカイブ作成権限がありません" }, { status: 403 });
      }
    }
  }

  try {
    const { databases } = createAdminClient();
    const doc = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_ARCHIVES_COLLECTION_ID,
      ID.unique(),
      {
        title,
        description: description || "",
        youtube_url,
        thumbnail_url: thumbnail_url || "",
        target_type,
        target_id,
        created_by: auth.currentUser!.$id,
        created_at: new Date().toISOString(),
      }
    );

    return NextResponse.json({ success: true, id: doc.$id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "作成に失敗しました";
    console.error("Create archive error:", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
