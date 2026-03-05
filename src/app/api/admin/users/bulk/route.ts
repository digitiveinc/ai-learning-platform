import { NextResponse } from "next/server";
import { ID } from "node-appwrite";
import { getUser, getUserRole, getUserCompanyId, createAdminClient } from "@/lib/appwrite/server";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_USER_SETTINGS_COLLECTION_ID,
} from "@/lib/appwrite/config";
import { employeeIdToEmail } from "@/lib/appwrite/employee-id";

type CsvRow = {
  employeeId: string;
  password: string;
  displayName: string;
  level: string;
  accessMode: string;
};

export async function POST(request: Request) {
  const currentUser = await getUser();
  if (!currentUser) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  const role = await getUserRole(currentUser.$id);
  if (role !== "admin" && role !== "superadmin") {
    return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  }

  const { rows, companyId } = await request.json() as { rows: CsvRow[]; companyId?: string };

  if (!rows || rows.length === 0) {
    return NextResponse.json({ error: "データがありません" }, { status: 400 });
  }

  // 会社ID決定
  let targetCompanyId = companyId;
  if (role !== "superadmin") {
    targetCompanyId = await getUserCompanyId(currentUser.$id);
  }

  // 会社コード取得
  let companyCode: string | undefined;
  if (targetCompanyId) {
    const { databases } = createAdminClient();
    try {
      const doc = await databases.getDocument(APPWRITE_DATABASE_ID, "companies", targetCompanyId);
      companyCode = doc.company_code;
    } catch { /* fallback */ }
  }

  const { users, databases } = createAdminClient();
  const results: { row: number; employeeId: string; success: boolean; error?: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const employeeId = row.employeeId?.trim();
    const password = row.password?.trim();
    const displayName = row.displayName?.trim() || "";
    const level = row.level?.trim() || "";
    const accessMode = row.accessMode?.trim() || "cumulative";

    if (!employeeId || !password) {
      results.push({ row: i + 1, employeeId: employeeId || "", success: false, error: "社員IDとパスワードは必須です" });
      continue;
    }

    if (password.length < 8) {
      results.push({ row: i + 1, employeeId, success: false, error: "パスワードは8文字以上" });
      continue;
    }

    const validLevels = ["beginner", "intermediate", "advanced", ""];
    if (!validLevels.includes(level)) {
      results.push({ row: i + 1, employeeId, success: false, error: `無効なレベル: ${level}` });
      continue;
    }

    const email = employeeIdToEmail(employeeId, companyCode);

    try {
      const newUser = await users.create(ID.unique(), email, undefined, password, displayName || employeeId);

      if (level) {
        await users.updateLabels(newUser.$id, [level]);
      }

      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_USER_SETTINGS_COLLECTION_ID,
        ID.unique(),
        {
          user_id: newUser.$id,
          employee_id: employeeId.toUpperCase(),
          access_mode: accessMode === "exact" ? "exact" : "cumulative",
          display_name: displayName,
          company_id: targetCompanyId || "",
        }
      );

      results.push({ row: i + 1, employeeId, success: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "作成失敗";
      results.push({ row: i + 1, employeeId, success: false, error: msg });
    }
  }

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  return NextResponse.json({ results, successCount, failCount });
}
