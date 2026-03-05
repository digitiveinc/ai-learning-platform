import Link from "next/link";
import { Query } from "node-appwrite";
import { requireAdmin } from "@/lib/appwrite/auth-guard";
import { createAdminClient, getUserEmployeeId } from "@/lib/appwrite/server";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_VIDEOS_COLLECTION_ID,
  APPWRITE_INQUIRIES_COLLECTION_ID,
} from "@/lib/appwrite/config";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { user, role } = await requireAdmin();
  const employeeId = await getUserEmployeeId(user.$id);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header email={user!.email} role={role} employeeId={employeeId} />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">管理ダッシュボード</h1>

        <div className="grid gap-6 md:grid-cols-3">
          <Link href="/admin/videos">
            <Card className="transition-colors hover:border-gray-400 cursor-pointer">
              <CardHeader>
                <CardTitle>動画管理</CardTitle>
                <CardDescription>研修動画の追加・編集・削除</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{videosRes.total}</p>
                <p className="text-sm text-gray-500">登録済み動画</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/users">
            <Card className="transition-colors hover:border-gray-400 cursor-pointer">
              <CardHeader>
                <CardTitle>ユーザー管理</CardTitle>
                <CardDescription>ユーザーの追加・編集・レベル管理</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{usersRes.total}</p>
                <p className="text-sm text-gray-500">登録済みユーザー</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/inquiries">
            <Card className="transition-colors hover:border-gray-400 cursor-pointer">
              <CardHeader>
                <CardTitle>問い合わせ管理</CardTitle>
                <CardDescription>ユーザーからの問い合わせ対応</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{inquiriesRes.total}</p>
                <p className="text-sm text-gray-500">未対応の問い合わせ</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {role === "superadmin" && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">スーパー管理者</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Link href="/admin/companies">
                <Card className="transition-colors hover:border-gray-400 cursor-pointer border-l-4 border-l-amber-400">
                  <CardHeader>
                    <CardTitle>企業管理</CardTitle>
                    <CardDescription>企業の追加・編集・管理</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">マルチテナント管理</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
