import Link from "next/link";
import { requireAdmin } from "@/lib/firebase/auth-guard";
import { Header } from "@/components/header";
import { ArchiveForm } from "@/components/archive-form";

export const dynamic = "force-dynamic";

export default async function CreateArchivePage() {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header email={user.email} role={user.role} displayName={user.displayName} />
      <main className="container mx-auto px-4 py-8">
        <Link href="/admin/archives" className="text-sm text-blue-600 hover:underline">
          &larr; アーカイブ管理に戻る
        </Link>
        <h1 className="text-3xl font-bold mt-2 mb-6">アーカイブを追加</h1>
        <ArchiveForm />
      </main>
    </div>
  );
}
