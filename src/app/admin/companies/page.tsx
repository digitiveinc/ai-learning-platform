import Link from "next/link";
import { Query } from "node-appwrite";
import { requireSuperAdmin } from "@/lib/appwrite/auth-guard";
import { createAdminClient, getUserEmployeeId } from "@/lib/appwrite/server";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_COMPANIES_COLLECTION_ID,
} from "@/lib/appwrite/config";
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

export const dynamic = "force-dynamic";

export default async function AdminCompaniesPage() {
  const { user, role } = await requireSuperAdmin();
  const employeeId = await getUserEmployeeId(user.$id);

  const { databases } = createAdminClient();
  const res = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_COMPANIES_COLLECTION_ID,
    [Query.orderDesc("created_at"), Query.limit(100)]
  );

  const companies = res.documents.map((d) => ({
    id: d.$id,
    company_name: d.company_name,
    company_code: d.company_code,
    is_active: d.is_active ?? true,
    created_at: d.created_at,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header email={user.email} role={role} employeeId={employeeId} />
      <main className="container mx-auto px-4 py-8">
        <Link href="/admin" className="text-sm text-blue-600 hover:underline">
          ← 管理ダッシュボードに戻る
        </Link>
        <div className="flex items-center justify-between mt-2 mb-6">
          <h1 className="text-3xl font-bold">企業管理</h1>
          <Link href="/admin/companies/create">
            <Button>企業を追加</Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>企業コード</TableHead>
                <TableHead>企業名</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>登録日</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono font-medium">{c.company_code}</TableCell>
                  <TableCell>{c.company_name}</TableCell>
                  <TableCell>
                    <Badge className={c.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {c.is_active ? "有効" : "無効"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(c.created_at).toLocaleDateString("ja-JP")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/companies/${c.id}/edit`}>
                      <Button variant="outline" size="sm">編集</Button>
                    </Link>
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
