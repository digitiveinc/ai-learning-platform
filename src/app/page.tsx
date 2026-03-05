import Link from "next/link";
import { Query } from "node-appwrite";
import { requireAuth } from "@/lib/appwrite/auth-guard";
import { createAdminClient, getUserAccessibleLevels, getUserEmployeeId, getUserSettings } from "@/lib/appwrite/server";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_VIDEOS_COLLECTION_ID,
  APPWRITE_WATCH_PROGRESS_COLLECTION_ID,
} from "@/lib/appwrite/config";
import { Header } from "@/components/header";
import { ProgressBar } from "@/components/progress-bar";
import type { Video } from "@/lib/types";

export const dynamic = "force-dynamic";

const levelMeta: Record<string, {
  title: string;
  subtitle: string;
  description: string;
  gradient: string;
  iconBg: string;
  icon: string;
  progressColor: string;
  badgeBg: string;
  badgeText: string;
}> = {
  beginner: {
    title: "初級",
    subtitle: "Beginner",
    description: "AIの基礎知識と概念を学びます",
    gradient: "from-emerald-500 to-teal-600",
    iconBg: "bg-emerald-100",
    icon: "beginner",
    progressColor: "bg-emerald-500",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
  },
  intermediate: {
    title: "中級",
    subtitle: "Intermediate",
    description: "実践的なAI活用スキルを習得します",
    gradient: "from-blue-500 to-indigo-600",
    iconBg: "bg-blue-100",
    icon: "intermediate",
    progressColor: "bg-blue-500",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
  },
  advanced: {
    title: "上級",
    subtitle: "Advanced",
    description: "ビジネス活用とリーダーシップを学びます",
    gradient: "from-violet-500 to-purple-600",
    iconBg: "bg-violet-100",
    icon: "advanced",
    progressColor: "bg-violet-500",
    badgeBg: "bg-violet-50",
    badgeText: "text-violet-700",
  },
};

function LevelIcon({ type, className }: { type: string; className?: string }) {
  if (type === "beginner") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1.5M12 19.5V21M4.219 4.219l1.061 1.061M17.72 17.72l1.06 1.06M3 12h1.5M19.5 12H21M4.219 19.781l1.061-1.061M17.72 6.28l1.06-1.06" />
        <circle cx="12" cy="12" r="4.5" />
      </svg>
    );
  }
  if (type === "intermediate") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.58-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
  );
}

export default async function DashboardPage() {
  const { user, role } = await requireAuth();

  const accessibleLevels = await getUserAccessibleLevels(user.$id);
  const employeeId = await getUserEmployeeId(user.$id);
  const settings = await getUserSettings(user.$id);
  const displayName = settings?.display_name || employeeId;

  const { databases } = createAdminClient();

  const videosRes = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_VIDEOS_COLLECTION_ID,
    [Query.limit(500)]
  );

  const progressRes = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_WATCH_PROGRESS_COLLECTION_ID,
    [Query.equal("user_id", user.$id), Query.equal("watched", true), Query.limit(500)]
  );
  const watchedVideoIds = new Set(progressRes.documents.map((d) => d.video_id));

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
  const totalPercent = totalVideos === 0 ? 0 : Math.round((totalWatched / totalVideos) * 100);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header email={user.email} role={role} employeeId={employeeId} displayName={displayName} />

      {/* Hero area */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        {/* Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />

        <div className="relative container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <p className="text-indigo-300 text-sm font-medium mb-1">AI Learning Platform</p>
              <h1 className="text-3xl font-bold">
                おかえりなさい、<span className="text-indigo-300">{displayName}</span>さん
              </h1>
              <p className="text-slate-400 mt-2">
                レベルを選択して学習を始めましょう。
              </p>
            </div>
            <div className="flex-shrink-0 w-full md:w-64">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-300">全体の進捗</span>
                  <span className="text-2xl font-bold">{totalPercent}%</span>
                </div>
                <ProgressBar watched={totalWatched} total={totalVideos} color="bg-indigo-400" variant="hero" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          {(["beginner", "intermediate", "advanced"] as Video["level"][]).map((key) => {
            const meta = levelMeta[key];
            const accessible = accessibleLevels.includes(key);
            const count = videoCounts[key] || 0;
            const watched = watchedCounts[key] || 0;

            if (!accessible) {
              return (
                <div key={key} className="relative rounded-xl border border-slate-200 bg-white p-6 opacity-50 cursor-not-allowed">
                  <div className={`w-12 h-12 rounded-xl ${meta.iconBg} flex items-center justify-center mb-4 opacity-50`}>
                    <LevelIcon type={meta.icon} className="w-6 h-6 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-400">{meta.title}</h3>
                  <p className="text-xs text-slate-300 font-medium uppercase tracking-wider">{meta.subtitle}</p>
                  <p className="text-sm text-slate-400 mt-2">アクセス権限がありません</p>
                </div>
              );
            }

            return (
              <Link key={key} href={`/videos/${key}`}>
                <div className="group relative rounded-xl border border-slate-200 bg-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1 h-full">
                  {/* Top accent stripe */}
                  <div className={`h-1.5 bg-gradient-to-r ${meta.gradient}`} />
                  <div className="p-6">
                    <div className={`w-12 h-12 rounded-xl ${meta.iconBg} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
                      <LevelIcon type={meta.icon} className={`w-6 h-6 ${meta.badgeText}`} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">{meta.title}</h3>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-0.5">{meta.subtitle}</p>
                    <p className="text-sm text-slate-500 mt-3">{meta.description}</p>
                    <div className="mt-5">
                      <ProgressBar watched={watched} total={count} color={meta.progressColor} />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${meta.badgeBg} ${meta.badgeText}`}>
                        {count} 本の動画
                      </span>
                      <span className="text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
