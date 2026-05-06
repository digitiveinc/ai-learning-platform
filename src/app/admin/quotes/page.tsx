import Link from "next/link";
import { requireAdmin } from "@/lib/firebase/auth-guard";
import { adminDb } from "@/lib/firebase/admin";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Quote } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminQuotesPage() {
  const user = await requireAdmin();

  const db = adminDb();
  const snap = await db.collection("quotes").orderBy("publishDate", "desc").get();
  const quotes = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Quote));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header email={user.email} role={user.role} displayName={user.displayName} />
      <main className="container mx-auto px-4 py-8">
        <Link href="/admin" className="text-sm text-blue-600 hover:underline">
          ← 管理ダッシュボードに戻る
        </Link>
        <div className="flex items-center justify-between mt-2 mb-6">
          <h1 className="text-3xl font-bold">今日の一言管理</h1>
          <Link href="/admin/quotes/create">
            <Button>一言を追加</Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>公開日</TableHead>
                <TableHead>本文</TableHead>
                <TableHead>著者</TableHead>
                <TableHead>作成日</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                    一言がまだ登録されていません
                  </TableCell>
                </TableRow>
              ) : (
                quotes.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-mono text-sm font-medium whitespace-nowrap">
                      {q.publishDate}
                    </TableCell>
                    <TableCell className="max-w-sm truncate text-sm">
                      {q.text}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {q.author || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-slate-400 whitespace-nowrap">
                      {new Date(q.createdAt).toLocaleDateString("ja-JP")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Link href={`/admin/quotes/${q.id}/edit`}>
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
