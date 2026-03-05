import Link from "next/link";
import { notFound } from "next/navigation";
import { Query } from "node-appwrite";
import { requireAdmin } from "@/lib/appwrite/auth-guard";
import { createAdminClient, getUserLevel, getUserEmployeeId } from "@/lib/appwrite/server";
import { Header } from "@/components/header";
import { UserForm } from "@/components/user-form";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_USER_SETTINGS_COLLECTION_ID,
  APPWRITE_COMPANIES_COLLECTION_ID,
} from "@/lib/appwrite/config";
import { emailToEmployeeId } from "@/lib/appwrite/employee-id";

export const dynamic = "force-dynamic";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user: currentUser, role, companyId } = await requireAdmin();
  const currentEmployeeId = await getUserEmployeeId(currentUser.$id);

  const { users, databases } = createAdminClient();

  let targetUser;
  try {
    targetUser = await users.get(id);
  } catch {
    notFound();
  }

  const settingsRes = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_USER_SETTINGS_COLLECTION_ID,
    [Query.equal("user_id", id), Query.limit(1)]
  );
  const settings = settingsRes.documents[0];

  const targetEmployeeId = settings?.employee_id || emailToEmployeeId(targetUser.email);
  const userLevel = getUserLevel(targetUser.labels || []);
  const userRole = targetUser.labels?.includes("superadmin")
    ? "superadmin"
    : targetUser.labels?.includes("admin")
      ? "admin"
      : "user";

  // superadminの場合は企業一覧を取得
  let companies: { id: string; company_name: string; company_code: string }[] = [];
  if (role === "superadmin") {
    const res = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_COMPANIES_COLLECTION_ID,
      [Query.equal("is_active", true), Query.limit(100)]
    );
    companies = res.documents.map((d) => ({
      id: d.$id,
      company_name: d.company_name,
      company_code: d.company_code,
    }));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header email={currentUser.email} role={role} employeeId={currentEmployeeId} />
      <main className="container mx-auto px-4 py-8">
        <Link href="/admin/users" className="text-sm text-blue-600 hover:underline">
          &larr; ユーザー管理に戻る
        </Link>
        <div className="mt-4">
          <UserForm
            mode="edit"
            currentRole={role}
            currentCompanyId={companyId}
            companies={companies}
            initialData={{
              id,
              employeeId: targetEmployeeId,
              displayName: targetUser.name || "",
              level: userLevel || "beginner",
              accessMode: settings?.access_mode || "cumulative",
              role: userRole,
              companyId: settings?.company_id || "",
            }}
          />
        </div>
      </main>
    </div>
  );
}
