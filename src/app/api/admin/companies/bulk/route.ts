import { NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";
import { getUser, getUserRole, createAdminClient } from "@/lib/appwrite/server";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_COMPANIES_COLLECTION_ID,
} from "@/lib/appwrite/config";

type CsvRow = {
  companyCode: string;
  companyName: string;
};

export async function POST(request: Request) {
  const currentUser = await getUser();
  if (!currentUser) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  const role = await getUserRole(currentUser.$id);
  if (role !== "superadmin") {
    return NextResponse.json({ error: "スーパー管理者権限が必要です" }, { status: 403 });
  }

  const { rows } = await request.json() as { rows: CsvRow[] };

  if (!rows || rows.length === 0) {
    return NextResponse.json({ error: "データがありません" }, { status: 400 });
  }

  const { databases } = createAdminClient();
  const results: { row: number; companyCode: string; success: boolean; error?: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const companyCode = row.companyCode?.trim().toUpperCase();
    const companyName = row.companyName?.trim();

    if (!companyCode || !companyName) {
      results.push({ row: i + 1, companyCode: companyCode || "", success: false, error: "企業コードと企業名は必須です" });
      continue;
    }

    try {
      // 重複チェック
      const existing = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_COMPANIES_COLLECTION_ID,
        [Query.equal("company_code", companyCode), Query.limit(1)]
      );
      if (existing.documents.length > 0) {
        results.push({ row: i + 1, companyCode, success: false, error: "企業コードが既に存在します" });
        continue;
      }

      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_COMPANIES_COLLECTION_ID,
        ID.unique(),
        {
          company_name: companyName,
          company_code: companyCode,
          is_active: true,
          created_at: new Date().toISOString(),
        }
      );

      results.push({ row: i + 1, companyCode, success: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "作成失敗";
      results.push({ row: i + 1, companyCode, success: false, error: msg });
    }
  }

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  return NextResponse.json({ results, successCount, failCount });
}
