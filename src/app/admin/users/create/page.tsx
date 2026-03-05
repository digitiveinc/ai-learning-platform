import Link from "next/link";
import { Query } from "node-appwrite";
import { requireAdmin } from "@/lib/appwrite/auth-guard";
import { createAdminClient, getUserEmployeeId } from "@/lib/appwrite/server";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_COMPANIES_COLLECTION_ID,
} from "@/lib/appwrite/config";
import { Header } from "@/components/header";
import { UserForm } from "@/components/user-form";

export const dynamic = "force-dynamic";

export default async function CreateUserPage() {
  const { user, role, companyId } = await requireAdmin();
  const employeeId = await getUserEmployeeId(user.$id);

  // superadminの場合は企業一覧を取得
  let companies: { id: string; company_name: string; company_code: string }[] = [];
  if (role === "superadmin") {
    const { databases } = createAdminClient();
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
      <Header email={user.email} role={role} employeeId={employeeId} />
      <main className="container mx-auto px-4 py-8">
        <Link href="/admin/users" className="text-sm text-blue-600 hover:underline">
          &larr; ユーザー管理に戻る
        </Link>
        <div className="mt-4">
          <UserForm
            mode="create"
            currentRole={role}
            currentCompanyId={companyId}
            companies={companies}
          />
        </div>
      </main>
    </div>
  );
}
