/**
 * マルチテナント移行スクリプト
 *
 * 実行方法: npx tsx scripts/migrate-to-multitenant.ts
 *
 * 処理内容:
 * 1. digitive用デフォルト企業（DGT001）を作成
 * 2. 既存user_settingsにcompany_id設定
 * 3. 既存ユーザーのメールを新フォーマットに変更
 * 4. 管理者にsuperadminラベル付与
 */

import { Client, Databases, Users, ID, Query } from "node-appwrite";

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const API_KEY = process.env.APPWRITE_API_KEY!;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);
const users = new Users(client);

const COMPANY_CODE = "DGT001";
const COMPANY_NAME = "digitive";
const INTERNAL_DOMAIN = "internal.digitive.jp";

async function main() {
  console.log("=== マルチテナント移行開始 ===\n");

  // 1. デフォルト企業作成
  console.log("1. デフォルト企業（DGT001）を作成...");
  let companyId: string;
  try {
    const existing = await databases.listDocuments(DATABASE_ID, "companies", [
      Query.equal("company_code", COMPANY_CODE),
      Query.limit(1),
    ]);
    if (existing.documents.length > 0) {
      companyId = existing.documents[0].$id;
      console.log(`   既に存在: ${companyId}`);
    } else {
      const doc = await databases.createDocument(
        DATABASE_ID,
        "companies",
        ID.unique(),
        {
          company_name: COMPANY_NAME,
          company_code: COMPANY_CODE,
          is_active: true,
          created_at: new Date().toISOString(),
        }
      );
      companyId = doc.$id;
      console.log(`   作成完了: ${companyId}`);
    }
  } catch (err) {
    console.error("   企業作成エラー:", err);
    process.exit(1);
  }

  // 2. 既存user_settingsにcompany_id設定
  console.log("\n2. 既存user_settingsにcompany_id設定...");
  try {
    const settingsRes = await databases.listDocuments(DATABASE_ID, "user_settings", [
      Query.limit(500),
    ]);
    for (const doc of settingsRes.documents) {
      if (!doc.company_id) {
        await databases.updateDocument(DATABASE_ID, "user_settings", doc.$id, {
          company_id: companyId,
        });
        console.log(`   更新: ${doc.employee_id} → company_id=${companyId}`);
      }
    }
    console.log(`   ${settingsRes.documents.length}件処理完了`);
  } catch (err) {
    console.error("   user_settings更新エラー:", err);
  }

  // 3. 既存ユーザーのメールを新フォーマットに変更
  console.log("\n3. 既存ユーザーのメールを新フォーマットに変更...");
  try {
    const usersRes = await users.list();
    for (const user of usersRes.users) {
      if (user.email.endsWith(`@${INTERNAL_DOMAIN}`)) {
        const localPart = user.email.split("@")[0];
        // 既に会社コード付きなら（_を含む）スキップ
        if (localPart.includes("_")) {
          console.log(`   スキップ（既に新形式）: ${user.email}`);
          continue;
        }
        const newEmail = `${COMPANY_CODE.toLowerCase()}_${localPart}@${INTERNAL_DOMAIN}`;
        try {
          await users.updateEmail(user.$id, newEmail);
          console.log(`   更新: ${user.email} → ${newEmail}`);
        } catch (err) {
          console.error(`   メール更新エラー (${user.email}):`, err);
        }
      }
    }
  } catch (err) {
    console.error("   ユーザー一覧取得エラー:", err);
  }

  // 4. 管理者にsuperadminラベル付与
  console.log("\n4. 管理者にsuperadminラベル付与...");
  try {
    const usersRes = await users.list();
    for (const user of usersRes.users) {
      if (user.labels?.includes("admin") && !user.labels?.includes("superadmin")) {
        const newLabels = [...user.labels, "superadmin"];
        await users.updateLabels(user.$id, newLabels);
        console.log(`   superadmin付与: ${user.email}`);
      }
    }
  } catch (err) {
    console.error("   ラベル更新エラー:", err);
  }

  console.log("\n=== 移行完了 ===");
}

main().catch(console.error);
