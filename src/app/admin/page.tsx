import Link from "next/link";
import { Query } from "node-appwrite";
import { requireAdmin } from "@/lib/appwrite/auth-guard";
import { createAdminClient, getUserEmployeeId, getUserSettings } from "@/lib/appwrite/server";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_VIDEOS_COLLECTION_ID,
  APPWRITE_INQUIRIES_COLLECTION_ID,
} from "@/lib/appwrite/config";
import { Header } from "@/components/header";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { user, role } = await requireAdmin();
  const employeeId = await getUserEmployeeId(user.$id);
  const userSettings = await getUserSettings(user.$id);
  const displayName = userSettings?.display_name || employeeId;

  const { databases, users } = createAdminClient();

  const videosRes = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_VIDEOS_COLLECTION_ID
  );

  const usersRes = await users.list();

  const inquiriesRes = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_INQUIRIES_COLLECTION_ID,
    [Query.equal("status", "open"), Query.limit(500)]
  );

  const adminCards = [
    {
      href: "/admin/videos",
      title: "動画管理",
      description: "研修動画の追加・編集・削除",
      count: videosRes.total,
      countLabel: "登録済み動画",
      gradient: "from-blue-500 to-indigo-600",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      ),
    },
    {
      href: "/admin/users",
      title: "ユーザー管理",
      description: "ユーザーの追加・編集・レベル管理",
      count: usersRes.total,
      countLabel: "登録済みユーザー",
      gradient: "from-emerald-500 to-teal-600",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
      ),
    },
    {
      href: "/admin/inquiries",
      title: "問い合わせ管理",
      description: "ユーザーからの問い合わせ対応",
      count: inquiriesRes.total,
      countLabel: "未対応の問い合わせ",
      gradient: "from-amber-500 to-orange-600",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header email={user!.email} role={role} employeeId={employeeId} displayName={displayName} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">管理ダッシュボード</h1>
          <p className="text-slate-500 mt-1">研修プラットフォームの管理を行います</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {adminCards.map((card) => (
            <Link key={card.href} href={card.href}>
              <div className="group relative rounded-xl border border-slate-200 bg-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1 h-full">
                <div className={`h-1.5 bg-gradient-to-r ${card.gradient}`} />
                <div className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center mb-4 ${card.iconColor} transition-transform duration-300 group-hover:scale-110`}>
                    {card.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">{card.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{card.description}</p>
                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-bold text-slate-900">{card.count}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{card.countLabel}</p>
                    </div>
                    <span className="text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {role === "superadmin" && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">スーパー管理者</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Link href="/admin/companies">
                <div className="group relative rounded-xl border border-slate-200 bg-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1">
                  <div className="h-1.5 bg-gradient-to-r from-violet-500 to-purple-600" />
                  <div className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center mb-4 text-violet-600 transition-transform duration-300 group-hover:scale-110">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">企業管理</h3>
                    <p className="text-sm text-slate-500 mt-1">企業の追加・編集・管理</p>
                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-xs text-violet-600 font-medium bg-violet-50 px-3 py-1 rounded-full">マルチテナント管理</span>
                      <span className="text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
