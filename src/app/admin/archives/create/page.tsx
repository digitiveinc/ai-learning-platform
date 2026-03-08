import Link from "next/link";
import { Query } from "node-appwrite";
import { requireAdmin } from "@/lib/appwrite/auth-guard";
import { createAdminClient, getUserEmployeeId, getUserLevel } from "@/lib/appwrite/server";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_COMPANIES_COLLECTION_ID,
  APPWRITE_USER_SETTINGS_COLLECTION_ID,
} from "@/lib/appwrite/config";
import { Header } from "@/components/header";
import { ArchiveForm } from "@/components/archive-form";
import { emailToEmployeeId } from "@/lib/appwrite/employee-id";

export const dynamic = "force-dynamic";

export default async function CreateArchivePage() {
  const { user, role, companyId } = await requireAdmin();
  const employeeId = await getUserEmployeeId(user.$id);

  const { databases, users: usersApi } = createAdminClient();

  // 企業一覧を取得
  const companiesRes = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_COMPANIES_COLLECTION_ID,
    [Query.equal("is_active", true), Query.limit(100)]
  );
  const companies = companiesRes.documents.map((d) => ({
    id: d.$id,
    company_name: d.company_name,
  }));

  // ユーザー一覧を取得
  const usersRes = await usersApi.list();
  const settingsRes = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_USER_SETTINGS_COLLECTION_ID,
    [Query.limit(500)]
  );
  const settingsMap = new Map(
    settingsRes.documents.map((d) => [d.user_id, d])
  );

  const userList = usersRes.users
    .filter((u) => {
      // 管理者・スーパー管理者は対象外
      const level = getUserLevel(u.labels || []);
      if (!level) return false;
      if (role !== "superadmin") {
        const settings = settingsMap.get(u.$id);
        return settings?.company_id === companyId;
      }
      return true;
    })
    .map((u) => {
      const settings = settingsMap.get(u.$id);
      return {
        id: u.$id,
        displayName: u.name || "",
        employeeId: settings?.employee_id || emailToEmployeeId(u.email),
      };
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header email={user.email} role={role} employeeId={employeeId} />
      <main className="container mx-auto px-4 py-8">
        <Link href="/admin/archives" className="text-sm text-blue-600 hover:underline">
          &larr; アーカイブ管理に戻る
        </Link>
        <h1 className="text-3xl font-bold mt-2 mb-6">アーカイブを追加</h1>
        <ArchiveForm
          currentRole={role}
          currentCompanyId={companyId}
          companies={companies}
          users={userList}
        />
      </main>
    </div>
  );
}
