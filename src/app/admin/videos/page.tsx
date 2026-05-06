import Link from "next/link";
import { requireAdmin } from "@/lib/firebase/auth-guard";
import { adminDb } from "@/lib/firebase/admin";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LEVEL_LABELS, LEVEL_COLORS } from "@/lib/types";
import { DeleteVideoButton } from "./delete-button";
import type { Video } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminVideosPage() {
  const user = await requireAdmin();

  const db = adminDb();
  const snap = await db.collection("videos").orderBy("sortOrder").get();
  const videoList = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Video));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header email={user.email} role={user.role} displayName={user.displayName} />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin" className="text-sm text-blue-600 hover:underline">
              ← 管理ダッシュボードに戻る
            </Link>
            <h1 className="text-3xl font-bold mt-2">動画管理</h1>
          </div>
          <Link href="/admin/videos/new">
            <Button>動画を追加</Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">サムネ</TableHead>
                <TableHead>タイトル</TableHead>
                <TableHead>レベル</TableHead>
                <TableHead>表示順</TableHead>
                <TableHead>作成日</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videoList.length > 0 ? (
                videoList.map((video) => {
                  const level = video.level as Video["level"];
                  const thumbSrc = `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`;
                  return (
                    <TableRow key={video.id}>
                      <TableCell>
                        {video.youtubeId ? (
                          <img src={thumbSrc} alt="" className="w-16 h-10 object-cover rounded" />
                        ) : (
                          <div className="w-16 h-10 bg-slate-200 rounded flex items-center justify-center text-xs text-slate-400">-</div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{video.title}</TableCell>
                      <TableCell>
                        <Badge className={LEVEL_COLORS[level]}>
                          {LEVEL_LABELS[level]}
                        </Badge>
                      </TableCell>
                      <TableCell>{video.sortOrder}</TableCell>
                      <TableCell>
                        {new Date(video.createdAt).toLocaleDateString("ja-JP")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/videos/${video.id}/edit`}>
                            <Button variant="outline" size="sm">
                              編集
                            </Button>
                          </Link>
                          <DeleteVideoButton videoId={video.id} videoTitle={video.title} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    動画がまだ登録されていません
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
