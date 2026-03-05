import { NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";
import { getUser, getUserRole, createAdminClient } from "@/lib/appwrite/server";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_COMPANIES_COLLECTION_ID,
} from "@/lib/appwrite/config";

async function requireSuperAdminApi() {
  const currentUser = await getUser();
  if (!currentUser) {
    return { error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }) };
  }
  const role = await getUserRole(currentUser.$id);
  if (role !== "superadmin") {
    return { error: NextResponse.json({ error: "スーパー管理者権限が必要です" }, { status: 403 }) };
  }
  return { currentUser };
}

export async function GET() {
  const auth = await requireSuperAdminApi();
  if ("error" in auth && auth.error) return auth.error;

  try {
    const { databases } = createAdminClient();
    const res = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_COMPANIES_COLLECTION_ID,
      [Query.orderDesc("created_at"), Query.limit(100)]
    );

    const companies = res.documents.map((d) => ({
      id: d.$id,
      company_name: d.company_name,
      company_code: d.company_code,
      is_active: d.is_active ?? true,
      created_at: d.created_at,
    }));

    return NextResponse.json({ companies });
  } catch (err) {
    console.error("List companies error:", err);
    return NextResponse.json({ error: "企業一覧の取得に失敗しました" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireSuperAdminApi();
  if ("error" in auth && auth.error) return auth.error;

  const { companyName, companyCode } = await request.json();

  if (!companyName || !companyCode) {
    return NextResponse.json({ error: "企業名と企業コードは必須です" }, { status: 400 });
  }

  try {
    const { databases } = createAdminClient();

    // 企業コード重複チェック
    const existing = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_COMPANIES_COLLECTION_ID,
      [Query.equal("company_code", companyCode.toUpperCase()), Query.limit(1)]
    );
    if (existing.documents.length > 0) {
      return NextResponse.json({ error: "この企業コードは既に使用されています" }, { status: 400 });
    }

    const doc = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_COMPANIES_COLLECTION_ID,
      ID.unique(),
      {
        company_name: companyName,
        company_code: companyCode.toUpperCase(),
        is_active: true,
        created_at: new Date().toISOString(),
      }
    );

    return NextResponse.json({ success: true, id: doc.$id });
  } catch (err) {
    console.error("Create company error:", err);
    return NextResponse.json({ error: "企業の作成に失敗しました" }, { status: 500 });
  }
}
