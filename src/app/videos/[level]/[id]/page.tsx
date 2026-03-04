import Link from "next/link";
import { notFound } from "next/navigation";
import { getUser, getUserRole, createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_DATABASE_ID, APPWRITE_VIDEOS_COLLECTION_ID } from "@/lib/appwrite/config";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LEVEL_LABELS, LEVEL_COLORS } from "@/lib/types";
import { extractYouTubeId } from "@/lib/youtube";
import type { Video } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function VideoPlayerPage({
  params,
}: {
  params: Promise<{ level: string; id: string }>;
}) {
  const { level, id } = await params;
  const user = await getUser();
  const role = await getUserRole(user!.$id);

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

  const typedLevel = video.level as Video["level"];
  const videoId = extractYouTubeId(video.youtube_url);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header email={user!.email} role={role} />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href={`/videos/${level}`} className="text-sm text-blue-600 hover:underline">
            ← {LEVEL_LABELS[typedLevel]}一覧に戻る
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {videoId && (
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )}

          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-2xl font-bold">{video.title}</h1>
              <Badge className={LEVEL_COLORS[typedLevel]}>
                {LEVEL_LABELS[typedLevel]}
              </Badge>
            </div>

            <Separator className="my-4" />

            {video.description && (
              <p className="text-gray-700 whitespace-pre-wrap">{video.description}</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
