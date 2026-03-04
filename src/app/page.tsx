import Link from "next/link";
import { Query } from "node-appwrite";
import { requireAuth } from "@/lib/appwrite/auth-guard";
import { createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_DATABASE_ID, APPWRITE_VIDEOS_COLLECTION_ID } from "@/lib/appwrite/config";
import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const levels = [
  {
    key: "beginner",
    title: "初級",
    subtitle: "Beginner",
    description: "AIの基礎知識と概念を学びます",
    border: "border-l-emerald-400",
    bgLight: "bg-emerald-50",
    textColor: "text-emerald-700",
  },
  {
    key: "intermediate",
    title: "中級",
    subtitle: "Intermediate",
    description: "実践的なAI活用スキルを習得します",
    border: "border-l-blue-400",
    bgLight: "bg-blue-50",
    textColor: "text-blue-700",
  },
  {
    key: "advanced",
    title: "上級",
    subtitle: "Advanced",
    description: "高度なAI技術とアーキテクチャを学びます",
    border: "border-l-violet-400",
    bgLight: "bg-violet-50",
    textColor: "text-violet-700",
  },
];

export default async function DashboardPage() {
  const { user, role } = await requireAuth();

  const { databases } = createAdminClient();
  const response = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_VIDEOS_COLLECTION_ID,
    [Query.limit(500)]
  );

  const videoCounts: Record<string, number> = {};
  response.documents.forEach((v) => {
    videoCounts[v.level] = (videoCounts[v.level] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header email={user.email} role={role} />

      {/* ヒーローエリア */}
      <div className="bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-semibold">
            おかえりなさい
          </h1>
          <p className="text-slate-400 mt-1">
            レベルを選択して学習を始めてください。
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-5 md:grid-cols-3">
          {levels.map((level) => (
            <Link key={level.key} href={`/videos/${level.key}`}>
              <Card className={`transition-all duration-200 cursor-pointer hover:shadow-md border-l-4 ${level.border} bg-white`}>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold text-slate-800">{level.title}</h3>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{level.subtitle}</p>
                  <p className="text-sm text-slate-500 mt-2">{level.description}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${level.bgLight} ${level.textColor}`}>
                      {videoCounts[level.key] || 0} 本の動画
                    </span>
                    <span className="text-slate-300 text-sm">→</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
