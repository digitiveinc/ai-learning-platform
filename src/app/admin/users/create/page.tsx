import Link from "next/link";
import { requireAdmin } from "@/lib/appwrite/auth-guard";
import { getUserEmployeeId } from "@/lib/appwrite/server";
import { Header } from "@/components/header";
import { UserForm } from "@/components/user-form";

export const dynamic = "force-dynamic";

export default async function CreateUserPage() {
  const { user, role } = await requireAdmin();
  const employeeId = await getUserEmployeeId(user.$id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header email={user.email} role={role} employeeId={employeeId} />
      <main className="container mx-auto px-4 py-8">
        <Link href="/admin/users" className="text-sm text-blue-600 hover:underline">
          &larr; ユーザー管理に戻る
        </Link>
        <div className="mt-4">
          <UserForm mode="create" />
        </div>
      </main>
    </div>
  );
}
