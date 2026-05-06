import Link from "next/link";
import { requireAdmin } from "@/lib/firebase/auth-guard";
import { adminDb } from "@/lib/firebase/admin";
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
import { LEVEL_LABELS, LEVEL_COLORS } from "@/lib/types";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

const roleLabels: Record<string, string> = {
  superadmin: "スーパー管理者",
  admin: "管理者",
  user: "一般",
};

export default async function AdminUsersPage() {
  const currentUser = await requireAdmin();

  const db = adminDb();
  const snap = await db.collection("users").orderBy("createdAt", "desc").get();
  type UserDoc = Profile & { id: string };
  const users = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as UserDoc);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header email={currentUser.email} role={currentUser.role} displayName={currentUser.displayName} />
      <main className="container mx-auto px-4 py-8">
        <Link href="/admin" className="text-sm text-blue-600 hover:underline">
          ← 管理ダッシュボードに戻る
        </Link>
        <div className="flex items-center justify-between mt-2 mb-6">
          <h1 className="text-3xl font-bold">ユーザー管理</h1>
          <Link href="/admin/users/create">
            <Button>ユーザーを追加</Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>表示名</TableHead>
                <TableHead>メールアドレス</TableHead>
                <TableHead>ロール</TableHead>
                <TableHead>レベル</TableHead>
                <TableHead>アクセス</TableHead>
                <TableHead>登録日</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    ユーザーがいません
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.displayName || "-"}</TableCell>
                    <TableCell className="text-sm text-slate-600">{u.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={u.role === "user" ? "secondary" : "default"}
                        className={u.role === "superadmin" ? "bg-amber-100 text-amber-800" : ""}
                      >
                        {roleLabels[u.role] ?? u.role}
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
