import { NextResponse } from "next/server";
import { ID } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite/server";
import { getUser, getUserRole, getUserCompanyId } from "@/lib/appwrite/server";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_USER_SETTINGS_COLLECTION_ID,
} from "@/lib/appwrite/config";
import { employeeIdToEmail } from "@/lib/appwrite/employee-id";
import { getCompanyByCode } from "@/lib/appwrite/server";

export async function POST(request: Request) {
  const currentUser = await getUser();
  if (!currentUser) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  const role = await getUserRole(currentUser.$id);
  if (role !== "admin" && role !== "superadmin") {
    return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  }

  const { employeeId, password, displayName, level, accessMode, companyId } = await request.json();

  if (!employeeId || !password) {
    return NextResponse.json(
      { error: "社員IDとパスワードは必須です" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "パスワードは8文字以上で入力してください" },
      { status: 400 }
    );
  }

  const validLevels = ["beginner", "intermediate", "advanced"];
  if (level && !validLevels.includes(level)) {
    return NextResponse.json({ error: "無効なレベルです" }, { status: 400 });
  }

  // 会社ID決定: superadminは指定可能、adminは自社のみ
  let targetCompanyId = companyId;
  if (role !== "superadmin") {
    targetCompanyId = await getUserCompanyId(currentUser.$id);
  }

  // 会社のcompany_codeを取得（メール生成用）
  let companyCode: string | undefined;
  if (targetCompanyId) {
    const { databases } = createAdminClient();
    try {
      const companyDoc = await databases.getDocument(
        APPWRITE_DATABASE_ID,
        "companies",
        targetCompanyId
      );
      companyCode = companyDoc.company_code;
    } catch {
      // company_codeが取得できない場合はフォールバック
    }
  }

  const email = employeeIdToEmail(employeeId, companyCode);

  try {
    const { users, databases } = createAdminClient();

    // ユーザー作成
    const newUser = await users.create(
      ID.unique(),
      email,
      undefined,
      password,
      displayName || employeeId
    );

    // レベルラベル設定
    if (level) {
      await users.updateLabels(newUser.$id, [level]);
    }

    // user_settings ドキュメント作成
    await databases.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_USER_SETTINGS_COLLECTION_ID,
      ID.unique(),
      {
        user_id: newUser.$id,
        employee_id: employeeId.toUpperCase(),
        access_mode: accessMode || "cumulative",
        display_name: displayName || "",
        company_id: targetCompanyId || "",
      }
    );

    return NextResponse.json({ success: true, userId: newUser.$id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "ユーザー作成に失敗しました";
    console.error("Create user error:", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
