import Link from "next/link";
import { Query } from "node-appwrite";
import { requireAdmin } from "@/lib/appwrite/auth-guard";
import { createAdminClient, getUserEmployeeId } from "@/lib/appwrite/server";
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
  APPWRITE_ARCHIVES_COLLECTION_ID,
  APPWRITE_COMPANIES_COLLECTION_ID,
  APPWRITE_USER_SETTINGS_COLLECTION_ID,
} from "@/lib/appwrite/config";
import { TARGET_TYPE_LABELS } from "@/lib/types";
import type { Archive } from "@/lib/types";
import { ArchiveDeleteButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function AdminArchivesPage() {
  const { user: currentUser, role, companyId } = await requireAdmin();
  const currentEmployeeId = await getUserEmployeeId(currentUser.$id);

  const { databases } = createAdminClient();

  const queries = [Query.orderDesc("created_at"), Query.limit(500)];
  if (role !== "superadmin" && companyId) {
    queries.push(Query.equal("target_type", "company"));
    queries.push(Query.equal("target_id", companyId));
  }

  const archivesRes = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_ARCHIVES_COLLECTION_ID,
    queries
  );

  // 企業名を解決
  const companiesRes = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_COMPANIES_COLLECTION_ID,
    [Query.limit(500)]
  );
  const companyMap = new Map(
    companiesRes.documents.map((d) => [d.$id, d.company_name])
  );

  // ユーザー名を解決
  const settingsRes = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_USER_SETTINGS_COLLECTION_ID,
    [Query.limit(500)]
  );
  const userNameMap = new Map(
    settingsRes.documents.map((d) => [d.user_id, d.display_name || d.employee_id])
  );

  const archives: (Archive & { targetName: string })[] = archivesRes.documents.map((d) => ({
    id: d.$id,
    title: d.title,
    description: d.description || "",
    youtube_url: d.youtube_url,
    target_type: d.target_type,
    target_id: d.target_id,
    created_by: d.created_by,
    created_at: d.created_at,
    targetName:
      d.target_type === "company"
        ? companyMap.get(d.target_id) || d.target_id
        : userNameMap.get(d.target_id) || d.target_id,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header email={currentUser!.email} role={role} employeeId={currentEmployeeId} />
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
                <TableHead>タイトル</TableHead>
                <TableHead>対象種別</TableHead>
                <TableHead>対象名</TableHead>
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
                archives.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.title}</TableCell>
                    <TableCell>
                      <Badge className="bg-amber-100 text-amber-800">
                        {TARGET_TYPE_LABELS[a.target_type]}
                      </Badge>
                    </TableCell>
                    <TableCell>{a.targetName}</TableCell>
                    <TableCell>
                      {new Date(a.created_at).toLocaleDateString("ja-JP")}
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
