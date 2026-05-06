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
import { ArchiveDeleteButton } from "./delete-button";
import type { Archive } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminArchivesPage() {
  const user = await requireAdmin();

  const db = adminDb();
  const snap = await db.collection("archives").orderBy("createdAt", "desc").get();
  const archives = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Archive));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header email={user.email} role={user.role} displayName={user.displayName} />
      <main className="container mx-auto px-4 py-8">
        <Link href="/admin" className="text-sm text-blue-600 hover:underline">
          ← 管理ダッシュボードに戻る
        </Link>
        <div className="flex items-center justify-between mt-2 mb-6">
          <h1 className="text-3xl font-bold">アーカイブ管理</h1>
          <Link href="/admin/archives/create">
            <Button>アーカイブを追加</Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">サムネ</TableHead>
                <TableHead>タイトル</TableHead>
                <TableHead>説明</TableHead>
                <TableHead>作成日</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {archives.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                    アーカイブがありません
                  </TableCell>
                </TableRow>
              ) : (
                archives.map((a) => {
                  const thumbSrc = a.thumbnailUrl ||
                    (a.youtubeId ? `https://img.youtube.com/vi/${a.youtubeId}/mqdefault.jpg` : null);
                  return (
                    <TableRow key={a.id}>
                      <TableCell>
                        {thumbSrc ? (
                          <img src={thumbSrc} alt="" className="w-16 h-10 object-cover rounded" />
                        ) : (
                          <div className="w-16 h-10 bg-slate-200 rounded flex items-center justify-center text-xs text-slate-400">-</div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{a.title}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-slate-500">
                        {a.description || "-"}
                      </TableCell>
                      <TableCell>
                        {new Date(a.createdAt).toLocaleDateString("ja-JP")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Link href={`/admin/archives/${a.id}/edit`}>
                            <Button variant="outline" size="sm">
                              編集
                            </Button>
                          </Link>
                          <ArchiveDeleteButton archiveId={a.id} title={a.title} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
