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
    gradient: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200 hover:border-emerald-400",
    icon: "🌱",
  },
  {
    key: "intermediate",
    title: "中級",
    subtitle: "Intermediate",
    description: "実践的なAI活用スキルを習得します",
    gradient: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200 hover:border-blue-400",
    icon: "📘",
  },
  {
    key: "advanced",
    title: "上級",
    subtitle: "Advanced",
    description: "高度なAI技術とアーキテクチャを学びます",
    gradient: "from-purple-500 to-pink-600",
    bgLight: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-200 hover:border-purple-400",
    icon: "🚀",
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
    <div className="min-h-screen bg-gray-50">
      <Header email={user.email} role={role} />

      {/* ヒーローエリア */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold">
            おかえりなさい 👋
          </h1>
          <p className="text-indigo-100 mt-2 text-lg">
            今日も学習を続けましょう。レベルを選択して始めてください。
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 -mt-6">
        <div className="grid gap-6 md:grid-cols-3">
          {levels.map((level) => (
            <Link key={level.key} href={`/videos/${level.key}`}>
              <Card className={`transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-1 ${level.borderColor} overflow-hidden`}>
                <div className={`h-2 bg-gradient-to-r ${level.gradient}`} />
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-3xl">{level.icon}</span>
                      <h3 className="text-xl font-bold mt-3">{level.title}</h3>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{level.subtitle}</p>
                      <p className="text-sm text-gray-500 mt-2">{level.description}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${level.bgLight} ${level.textColor}`}>
                      {videoCounts[level.key] || 0} 本の動画
                    </span>
                    <span className="text-gray-400 text-sm">→</span>
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
