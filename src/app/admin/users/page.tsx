import Link from "next/link";
import { Query } from "node-appwrite";
import { requireAdmin } from "@/lib/appwrite/auth-guard";
import { createAdminClient, getUserLevel, getUserEmployeeId } from "@/lib/appwrite/server";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_USER_SETTINGS_COLLECTION_ID,
} from "@/lib/appwrite/config";
import { LEVEL_LABELS, LEVEL_COLORS } from "@/lib/types";
import { emailToEmployeeId } from "@/lib/appwrite/employee-id";
import { UserDeleteButton } from "./user-delete-button";
import { UserCsvImport } from "./user-csv-import";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const { user: currentUser, role, companyId } = await requireAdmin();
  const currentEmployeeId = await getUserEmployeeId(currentUser.$id);

  const { users, databases } = createAdminClient();
  const usersRes = await users.list();

  // 全user_settingsを取得
  const settingsRes = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_USER_SETTINGS_COLLECTION_ID,
    [Query.limit(500)]
  );
  const settingsMap = new Map(
    settingsRes.documents.map((d) => [d.user_id, d])
  );

  const userList = usersRes.users
    .map((u) => {
      const settings = settingsMap.get(u.$id);
      const level = getUserLevel(u.labels || []);
      return {
        id: u.$id,
        employeeId: settings?.employee_id || emailToEmployeeId(u.email),
        displayName: u.name || "",
        role: u.labels?.includes("superadmin")
          ? "superadmin"
          : u.labels?.includes("admin")
            ? "admin"
            : "user",
        level,
        accessMode: settings?.access_mode || "cumulative",
        companyId: settings?.company_id || "",
        createdAt: u.$createdAt,
      };
    })
    // adminはcompanyId でフィルタ、superadminは全ユーザー
    .filter((u) => {
      if (role === "superadmin") return true;
      return u.companyId === companyId;
    });

  const roleLabels: Record<string, string> = {
    superadmin: "スーパー管理者",
    admin: "管理者",
    user: "一般",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header email={currentUser!.email} role={role} employeeId={currentEmployeeId} />
      <main className="container mx-auto px-4 py-8">
        <Link href="/admin" className="text-sm text-blue-600 hover:underline">
          ← 管理ダッシュボードに戻る
        </Link>
        <div className="flex items-center justify-between mt-2 mb-6">
          <h1 className="text-3xl font-bold">ユーザー管理</h1>
          <div className="flex gap-2">
            <UserCsvImport companyId={companyId} />
            <Link href="/admin/users/create">
              <Button>ユーザーを追加</Button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>社員ID</TableHead>
                <TableHead>表示名</TableHead>
                <TableHead>ロール</TableHead>
                <TableHead>レベル</TableHead>
                <TableHead>アクセス</TableHead>
                <TableHead>登録日</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userList.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-mono font-medium">
                    {u.employeeId}
                  </TableCell>
                  <TableCell>{u.displayName || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={u.role === "user" ? "secondary" : "default"}
                      className={u.role === "superadmin" ? "bg-amber-100 text-amber-800" : ""}
                    >
                      {roleLabels[u.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {u.level ? (
                      <Badge className={LEVEL_COLORS[u.level]}>
                        {LEVEL_LABELS[u.level]}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">未設定</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {u.accessMode === "cumulative" ? "累積" : "限定"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(u.createdAt).toLocaleDateString("ja-JP")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Link href={`/admin/users/${u.id}/edit`}>
                        <Button variant="outline" size="sm">
                          編集
                        </Button>
                      </Link>
                      {u.id !== currentUser!.$id && (
                        <UserDeleteButton userId={u.id} employeeId={u.employeeId} />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
