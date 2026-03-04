import Link from "next/link";
import { Query } from "node-appwrite";
import { requireAuth } from "@/lib/appwrite/auth-guard";
import { createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_DATABASE_ID, APPWRITE_VIDEOS_COLLECTION_ID } from "@/lib/appwrite/config";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const levels = [
  {
    key: "beginner",
    title: "初級",
    description: "AI の基礎知識を学ぶ動画です",
    color: "border-green-200 hover:border-green-400",
    icon: "🌱",
  },
  {
    key: "intermediate",
    title: "中級",
    description: "実践的な AI 活用スキルを学ぶ動画です",
    color: "border-blue-200 hover:border-blue-400",
    icon: "📘",
  },
  {
    key: "advanced",
    title: "上級",
    description: "高度な AI 技術やアーキテクチャを学ぶ動画です",
    color: "border-purple-200 hover:border-purple-400",
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
      <Header email={user!.email} role={role} />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">ダッシュボード</h1>
        <p className="text-gray-600 mb-8">学習したいレベルを選択してください</p>

        <div className="grid gap-6 md:grid-cols-3">
          {levels.map((level) => (
            <Link key={level.key} href={`/videos/${level.key}`}>
              <Card className={`transition-colors cursor-pointer ${level.color}`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{level.icon}</span>
                    <div>
                      <CardTitle>{level.title}</CardTitle>
                      <CardDescription>{level.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    {videoCounts[level.key] || 0} 本の動画
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
