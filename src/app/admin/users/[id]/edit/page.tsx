import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/firebase/auth-guard";
import { adminDb } from "@/lib/firebase/admin";
import { Header } from "@/components/header";
import { UserForm } from "@/components/user-form";

export const dynamic = "force-dynamic";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireAdmin();

  const db = adminDb();
  const doc = await db.collection("users").doc(id).get();
  if (!doc.exists) notFound();

  const data = doc.data()!;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header email={user.email} role={user.role} displayName={user.displayName} />
      <main className="container mx-auto px-4 py-8">
        <Link href="/admin/users" className="text-sm text-blue-600 hover:underline">
          &larr; ユーザー管理に戻る
        </Link>
        <div className="mt-4">
          <UserForm
            mode="edit"
            currentRole={user.role}
            initialData={{
              id,
              email: data.email ?? "",
              displayName: data.displayName ?? "",
              level: data.level ?? "beginner",
              accessMode: data.accessMode ?? "cumulative",
              role: data.role ?? "user",
            }}
          />
        </div>
      </main>
    </div>
  );
}
