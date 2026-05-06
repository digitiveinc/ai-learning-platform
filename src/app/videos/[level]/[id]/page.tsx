import Link from "next/link";
import { notFound } from "next/navigation";
import { requireLevelAccess } from "@/lib/firebase/auth-guard";
import { adminDb } from "@/lib/firebase/admin";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { YouTubePlayer } from "@/components/youtube-player";
import { LEVEL_LABELS, LEVEL_COLORS } from "@/lib/types";
import type { Video } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function VideoPlayerPage({
  params,
}: {
  params: Promise<{ level: string; id: string }>;
}) {
  const { level, id } = await params;

  const typedLevel = level as Video["level"];
  const user = await requireLevelAccess(typedLevel);

  const db = adminDb();
  const videoDoc = await db.collection("videos").doc(id).get();
  if (!videoDoc.exists) notFound();

  const video = { id: videoDoc.id, ...videoDoc.data() } as Video;

  const progressDoc = await db.collection("userProgress").doc(user.uid).get();
  const watchedMap: Record<string, { watched: boolean; progress?: number }> =
    progressDoc.exists ? (progressDoc.data()?.watched ?? {}) : {};

  const currentProgress = watchedMap[id]?.progress ?? 0;
  const watched = watchedMap[id]?.watched ?? false;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header email={user.email} role={user.role} displayName={user.displayName} />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href={`/videos/${level}`} className="text-sm text-blue-600 hover:underline">
            &larr; {LEVEL_LABELS[typedLevel]}一覧に戻る
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <YouTubePlayer
            videoId={video.youtubeId}
            videoDbId={id}
            initialProgress={currentProgress}
          />

          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-2xl font-bold">{video.title}</h1>
              <Badge className={LEVEL_COLORS[typedLevel]}>
                {LEVEL_LABELS[typedLevel]}
              </Badge>
              {watched && (
                <span className="inline-flex items-center gap-1 text-sm text-emerald-600 font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  視聴済み
                </span>
              )}
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
