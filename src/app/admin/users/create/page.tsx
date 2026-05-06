import Link from "next/link";
import { requireAdmin } from "@/lib/firebase/auth-guard";
import { Header } from "@/components/header";
import { UserForm } from "@/components/user-form";

export const dynamic = "force-dynamic";

export default async function CreateUserPage() {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header email={user.email} role={user.role} displayName={user.displayName} />
      <main className="container mx-auto px-4 py-8">
        <Link href="/admin/users" className="text-sm text-blue-600 hover:underline">
          &larr; ユーザー管理に戻る
        </Link>
        <div className="mt-4">
          <UserForm mode="create" currentRole={user.role} />
        </div>
      </main>
    </div>
  );
}
