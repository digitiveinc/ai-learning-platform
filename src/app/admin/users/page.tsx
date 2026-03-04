import Link from "next/link";
import { getUser, getUserRole, createAdminClient } from "@/lib/appwrite/server";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RoleToggleButton } from "./role-toggle";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const currentUser = await getUser();
  const role = await getUserRole(currentUser!.$id);

  const { users } = createAdminClient();
  const usersRes = await users.list();

  const userList = usersRes.users.map((u) => ({
    id: u.$id,
    email: u.email,
    role: u.labels?.includes("admin") ? "admin" : "user",
    createdAt: u.$createdAt,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header email={currentUser!.email} role={role} />
      <main className="container mx-auto px-4 py-8">
        <Link href="/admin" className="text-sm text-blue-600 hover:underline">
          ← 管理ダッシュボードに戻る
        </Link>
        <h1 className="text-3xl font-bold mt-2 mb-6">ユーザー管理</h1>

        <div className="bg-white rounded-lg shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>メールアドレス</TableHead>
                <TableHead>ロール</TableHead>
                <TableHead>登録日</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userList.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={u.role === "admin" ? "default" : "secondary"}
                    >
                      {u.role === "admin" ? "管理者" : "一般"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(u.createdAt).toLocaleDateString("ja-JP")}
                  </TableCell>
                  <TableCell className="text-right">
                    {u.id !== currentUser!.$id && (
                      <RoleToggleButton userId={u.id} currentRole={u.role} />
                    )}
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
