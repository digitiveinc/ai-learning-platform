import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSuperAdmin } from "@/lib/appwrite/auth-guard";
import { createAdminClient, getUserEmployeeId } from "@/lib/appwrite/server";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_COMPANIES_COLLECTION_ID,
} from "@/lib/appwrite/config";
import { Header } from "@/components/header";
import { CompanyForm } from "@/components/company-form";

export const dynamic = "force-dynamic";

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, role } = await requireSuperAdmin();
  const employeeId = await getUserEmployeeId(user.$id);

  const { databases } = createAdminClient();
  let company;
  try {
    company = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_COMPANIES_COLLECTION_ID,
      id
    );
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header email={user.email} role={role} employeeId={employeeId} />
      <main className="container mx-auto px-4 py-8">
        <Link href="/admin/companies" className="text-sm text-blue-600 hover:underline">
          ← 企業一覧に戻る
        </Link>
        <div className="mt-4">
          <CompanyForm
            mode="edit"
            initialData={{
              id: company.$id,
              companyName: company.company_name,
              companyCode: company.company_code,
              isActive: company.is_active ?? true,
            }}
          />
        </div>
      </main>
    </div>
  );
}
