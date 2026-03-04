import Link from "next/link";
import { notFound } from "next/navigation";
import { Query } from "node-appwrite";
import { getUser, getUserRole, createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_DATABASE_ID, APPWRITE_VIDEOS_COLLECTION_ID } from "@/lib/appwrite/config";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LEVEL_LABELS, LEVEL_COLORS } from "@/lib/types";
import { extractYouTubeId } from "@/lib/youtube";
import type { Video } from "@/lib/types";

export const dynamic = "force-dynamic";

const validLevels = ["beginner", "intermediate", "advanced"];

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
  const user = await getUser();
  const role = await getUserRole(user!.$id);

  const { databases } = createAdminClient();
  const response = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_VIDEOS_COLLECTION_ID,
    [
      Query.equal("level", typedLevel),
      Query.orderAsc("sort_order"),
      Query.limit(500),
    ]
  );

  const videoList = response.documents;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header email={user!.email} role={role} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            ← ダッシュボードに戻る
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-3xl font-bold">{LEVEL_LABELS[typedLevel]}</h1>
          <Badge className={LEVEL_COLORS[typedLevel]}>
            {videoList.length} 本
          </Badge>
        </div>

        {videoList.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {videoList.map((video) => {
              const videoId = extractYouTubeId(video.youtube_url);
              return (
                <Link key={video.$id} href={`/videos/${level}/${video.$id}`}>
                  <Card className="transition-colors hover:border-gray-400 cursor-pointer h-full">
                    {videoId && (
                      <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                        <img
                          src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{video.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {video.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
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
