import Link from "next/link";
import { requireSuperAdmin } from "@/lib/appwrite/auth-guard";
import { getUserEmployeeId } from "@/lib/appwrite/server";
import { Header } from "@/components/header";
import { CompanyForm } from "@/components/company-form";

export const dynamic = "force-dynamic";

export default async function CreateCompanyPage() {
  const { user, role } = await requireSuperAdmin();
  const employeeId = await getUserEmployeeId(user.$id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header email={user.email} role={role} employeeId={employeeId} />
      <main className="container mx-auto px-4 py-8">
        <Link href="/admin/companies" className="text-sm text-blue-600 hover:underline">
          ← 企業一覧に戻る
        </Link>
        <div className="mt-4">
          <CompanyForm mode="create" />
        </div>
      </main>
    </div>
  );
}
