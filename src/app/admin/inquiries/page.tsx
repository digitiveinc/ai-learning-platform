import Link from "next/link";
import { requireAdmin } from "@/lib/appwrite/auth-guard";
import { createAdminClient, getUserEmployeeId } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_INQUIRIES_COLLECTION_ID,
} from "@/lib/appwrite/config";
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
import { InquiryStatusButton } from "./inquiry-status-button";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  open: "未対応",
  in_progress: "対応中",
  resolved: "解決済み",
};

const statusColors: Record<string, string> = {
  open: "bg-red-100 text-red-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
};

export default async function AdminInquiriesPage() {
  const { user, role } = await requireAdmin();
  const employeeId = await getUserEmployeeId(user.$id);

  const { databases } = createAdminClient();
  const res = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_INQUIRIES_COLLECTION_ID,
    [Query.orderDesc("created_at"), Query.limit(100)]
  );

  const inquiries = res.documents.map((d) => ({
    id: d.$id,
    user_name: d.user_name,
    subject: d.subject,
    message: d.message,
    status: d.status || "open",
    created_at: d.created_at,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header email={user.email} role={role} employeeId={employeeId} />
      <main className="container mx-auto px-4 py-8">
        <Link href="/admin" className="text-sm text-blue-600 hover:underline">
          ← 管理ダッシュボードに戻る
        </Link>
        <h1 className="text-3xl font-bold mt-2 mb-6">問い合わせ管理</h1>

        <div className="bg-white rounded-lg shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>日時</TableHead>
                <TableHead>ユーザー</TableHead>
                <TableHead>件名</TableHead>
                <TableHead>メッセージ</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    問い合わせはまだありません
                  </TableCell>
                </TableRow>
              ) : (
                inquiries.map((inq) => (
                  <TableRow key={inq.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {new Date(inq.created_at).toLocaleString("ja-JP")}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{inq.user_name}</TableCell>
                    <TableCell className="font-medium">{inq.subject}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-gray-600">
                      {inq.message}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[inq.status]}>
                        {statusLabels[inq.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <InquiryStatusButton
                        inquiryId={inq.id}
                        currentStatus={inq.status}
                      />
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
