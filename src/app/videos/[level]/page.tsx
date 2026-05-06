import Link from "next/link";
import { notFound } from "next/navigation";
import { requireLevelAccess } from "@/lib/firebase/auth-guard";
import { adminDb } from "@/lib/firebase/admin";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { VideoCard } from "@/components/video-card";
import { ProgressBar } from "@/components/progress-bar";
import { LEVEL_LABELS, LEVEL_COLORS } from "@/lib/types";
import type { Video } from "@/lib/types";

export const dynamic = "force-dynamic";

const validLevels = ["beginner", "intermediate", "advanced"];

const progressColors: Record<string, string> = {
  beginner: "bg-emerald-500",
  intermediate: "bg-blue-500",
  advanced: "bg-violet-500",
};

export default async function VideoListPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level } = await params;

  if (!validLevels.includes(level)) {
    notFound();
  }

  const typedLevel = level as Video["level"];
  const user = await requireLevelAccess(typedLevel);

  const db = adminDb();
  const videosSnap = await db.collection("videos")
    .where("level", "==", typedLevel)
    .orderBy("sortOrder")
    .get();

  const progressDoc = await db.collection("userProgress").doc(user.uid).get();
  const watchedMap: Record<string, { watched: boolean; progress?: number }> =
    progressDoc.exists ? (progressDoc.data()?.watched ?? {}) : {};

  const videoList = videosSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Video));
  const watchedCount = videoList.filter((v) => watchedMap[v.id]?.watched === true).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header email={user.email} role={user.role} displayName={user.displayName} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            &larr; ダッシュボードに戻る
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">{LEVEL_LABELS[typedLevel]}</h1>
          <Badge className={LEVEL_COLORS[typedLevel]}>
            {videoList.length} 本
          </Badge>
        </div>

        <div className="max-w-sm mb-6">
          <ProgressBar
            watched={watchedCount}
            total={videoList.length}
            color={progressColors[level]}
          />
        </div>

        {videoList.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {videoList.map((video) => {
              const p = watchedMap[video.id];
              return (
                <VideoCard
                  key={video.id}
                  id={video.id}
                  title={video.title}
                  description={video.description}
                  youtubeId={video.youtubeId}
                  level={level}
                  watched={p?.watched || false}
                  progress={p?.progress || 0}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">このレベルの動画はまだ登録されていません。</p>
        )}
      </main>
    </div>
  );
}
