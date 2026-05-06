import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/firebase/auth-guard";
import { adminDb } from "@/lib/firebase/admin";
import { Header } from "@/components/header";
import { VideoForm } from "@/components/video-form";

export const dynamic = "force-dynamic";

export default async function EditVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireAdmin();

  const db = adminDb();
  const doc = await db.collection("videos").doc(id).get();
  if (!doc.exists) notFound();

  const v = doc.data()!;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header email={user.email} role={user.role} displayName={user.displayName} />
      <main className="container mx-auto px-4 py-8">
        <Link href="/admin/videos" className="text-sm text-blue-600 hover:underline">
          ← 動画管理に戻る
        </Link>
        <h1 className="text-3xl font-bold mt-2 mb-6">動画を編集</h1>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <VideoForm
            video={{
              id: doc.id,
              title: v.title ?? "",
              youtubeUrl: v.youtubeId ? `https://www.youtube.com/watch?v=${v.youtubeId}` : "",
              thumbnailUrl: v.thumbnailUrl ?? "",
              level: v.level ?? "beginner",
              description: v.description ?? "",
              sortOrder: v.sortOrder ?? 0,
            }}
          />
        </div>
      </main>
    </div>
  );
}
