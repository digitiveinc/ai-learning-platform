import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/firebase/auth-guard";
import { adminDb } from "@/lib/firebase/admin";
import { Header } from "@/components/header";
import { ArchiveForm } from "@/components/archive-form";

export const dynamic = "force-dynamic";

export default async function EditArchivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireAdmin();

  const db = adminDb();
  const doc = await db.collection("archives").doc(id).get();
  if (!doc.exists) notFound();

  const data = doc.data()!;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header email={user.email} role={user.role} displayName={user.displayName} />
      <main className="container mx-auto px-4 py-8">
        <Link href="/admin/archives" className="text-sm text-blue-600 hover:underline">
          &larr; アーカイブ管理に戻る
        </Link>
        <h1 className="text-3xl font-bold mt-2 mb-6">アーカイブを編集</h1>
        <ArchiveForm
          archive={{
            id: doc.id,
            title: data.title ?? "",
            description: data.description ?? "",
            youtubeId: data.youtubeId ?? "",
            thumbnailUrl: data.thumbnailUrl ?? "",
          }}
        />
      </main>
    </div>
  );
}
