import Link from "next/link";
import { Query } from "node-appwrite";
import { requireAuth } from "@/lib/appwrite/auth-guard";
import { createAdminClient, getUserAccessibleLevels, getUserEmployeeId } from "@/lib/appwrite/server";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_VIDEOS_COLLECTION_ID,
  APPWRITE_WATCH_PROGRESS_COLLECTION_ID,
} from "@/lib/appwrite/config";
import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/progress-bar";
import type { Video } from "@/lib/types";

export const dynamic = "force-dynamic";

const levelMeta: Record<string, { title: string; subtitle: string; description: string; border: string; bgLight: string; textColor: string; progressColor: string }> = {
  beginner: {
    title: "初級",
    subtitle: "Beginner",
    description: "AIの基礎知識と概念を学びます",
    border: "border-l-emerald-400",
    bgLight: "bg-emerald-50",
    textColor: "text-emerald-700",
    progressColor: "bg-emerald-500",
  },
  intermediate: {
    title: "中級",
    subtitle: "Intermediate",
    description: "実践的なAI活用スキルを習得します",
    border: "border-l-blue-400",
    bgLight: "bg-blue-50",
    textColor: "text-blue-700",
    progressColor: "bg-blue-500",
  },
  advanced: {
    title: "上級",
    subtitle: "Advanced",
    description: "ビジネス活用とリーダーシップを学びます",
    border: "border-l-violet-400",
    bgLight: "bg-violet-50",
    textColor: "text-violet-700",
    progressColor: "bg-violet-500",
  },
};

export default async function DashboardPage() {
  const { user, role } = await requireAuth();

  const accessibleLevels = await getUserAccessibleLevels(user.$id);
  const employeeId = await getUserEmployeeId(user.$id);

  const { databases } = createAdminClient();

  // 全動画を取得
  const videosRes = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_VIDEOS_COLLECTION_ID,
    [Query.limit(500)]
  );

  // 視聴進捗を取得
  const progressRes = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_WATCH_PROGRESS_COLLECTION_ID,
    [Query.equal("user_id", user.$id), Query.equal("watched", true), Query.limit(500)]
  );
  const watchedVideoIds = new Set(progressRes.documents.map((d) => d.video_id));

  // レベル別集計
  const videoCounts: Record<string, number> = {};
  const watchedCounts: Record<string, number> = {};
  videosRes.documents.forEach((v) => {
    videoCounts[v.level] = (videoCounts[v.level] || 0) + 1;
    if (watchedVideoIds.has(v.$id)) {
      watchedCounts[v.level] = (watchedCounts[v.level] || 0) + 1;
    }
  });

  const totalVideos = accessibleLevels.reduce((sum, l) => sum + (videoCounts[l] || 0), 0);
  const totalWatched = accessibleLevels.reduce((sum, l) => sum + (watchedCounts[l] || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header email={user.email} role={role} employeeId={employeeId} />

      {/* ヒーローエリア */}
      <div className="bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-semibold">
            おかえりなさい
          </h1>
          <p className="text-slate-400 mt-1">
            レベルを選択して学習を始めてください。
          </p>
          <div className="mt-6 max-w-sm">
            <ProgressBar watched={totalWatched} total={totalVideos} color="bg-emerald-400" />
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-5 md:grid-cols-3">
          {(["beginner", "intermediate", "advanced"] as Video["level"][]).map((key) => {
            const meta = levelMeta[key];
            const accessible = accessibleLevels.includes(key);
            const count = videoCounts[key] || 0;
            const watched = watchedCounts[key] || 0;

            if (!accessible) {
              return (
                <Card key={key} className={`border-l-4 ${meta.border} bg-white opacity-50 cursor-not-allowed`}>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold text-slate-400">{meta.title}</h3>
                    <p className="text-xs text-slate-300 font-medium uppercase tracking-wider">{meta.subtitle}</p>
                    <p className="text-sm text-slate-400 mt-2">アクセス権限がありません</p>
                  </CardContent>
                </Card>
              );
            }

            return (
              <Link key={key} href={`/videos/${key}`}>
                <Card className={`transition-all duration-200 cursor-pointer hover:shadow-md border-l-4 ${meta.border} bg-white`}>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold text-slate-800">{meta.title}</h3>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{meta.subtitle}</p>
                    <p className="text-sm text-slate-500 mt-2">{meta.description}</p>
                    <div className="mt-4">
                      <ProgressBar watched={watched} total={count} color={meta.progressColor} />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${meta.bgLight} ${meta.textColor}`}>
                        {count} 本の動画
                      </span>
                      <span className="text-slate-300 text-sm">&rarr;</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
