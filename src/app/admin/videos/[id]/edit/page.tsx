import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/appwrite/auth-guard";
import { createAdminClient, getUserEmployeeId } from "@/lib/appwrite/server";
import { APPWRITE_DATABASE_ID, APPWRITE_VIDEOS_COLLECTION_ID } from "@/lib/appwrite/config";
import { Header } from "@/components/header";
import { VideoForm } from "@/components/video-form";

export const dynamic = "force-dynamic";

export default async function EditVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, role } = await requireAdmin();
  const employeeId = await getUserEmployeeId(user.$id);

  const { databases } = createAdminClient();

  let video;
  try {
    video = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_VIDEOS_COLLECTION_ID,
      id
    );
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header email={user!.email} role={role} employeeId={employeeId} />
      <main className="container mx-auto px-4 py-8">
        <Link href="/admin/videos" className="text-sm text-blue-600 hover:underline">
          ← 動画管理に戻る
        </Link>
        <h1 className="text-3xl font-bold mt-2 mb-6">動画を編集</h1>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <VideoForm
            video={{
              id: video.$id,
              title: video.title,
              youtubeUrl: video.youtube_url,
              level: video.level,
              description: video.description,
              sortOrder: video.sort_order,
            }}
          />
        </div>
      </main>
    </div>
  );
}
