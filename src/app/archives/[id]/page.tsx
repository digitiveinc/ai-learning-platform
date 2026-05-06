import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/firebase/auth-guard";
import { adminDb } from "@/lib/firebase/admin";
import { Header } from "@/components/header";
import type { Archive } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ArchiveViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireAuth();

  const db = adminDb();
  const archiveDoc = await db.collection("archives").doc(id).get();
  if (!archiveDoc.exists) notFound();

  const archive = { id: archiveDoc.id, ...archiveDoc.data() } as Archive;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header email={user.email} role={user.role} displayName={user.displayName} />
      <main className="container mx-auto px-4 py-8">
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          &larr; ダッシュボードに戻る
        </Link>

        <div className="mt-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              アーカイブ
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">{archive.title}</h1>
          {archive.description && (
            <p className="text-slate-600 mb-6">{archive.description}</p>
          )}

          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
            {archive.youtubeId ? (
              <iframe
                src={`https://www.youtube.com/embed/${archive.youtubeId}`}
                title={archive.title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <p>動画を読み込めませんでした</p>
              </div>
            )}
          </div>

          <div className="mt-4 text-sm text-slate-400">
            作成日: {new Date(archive.createdAt).toLocaleDateString("ja-JP")}
          </div>
        </div>
      </main>
    </div>
  );
}
