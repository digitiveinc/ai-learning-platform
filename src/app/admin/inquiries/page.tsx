import Link from "next/link";
import { requireAdmin } from "@/lib/firebase/auth-guard";
import { adminDb } from "@/lib/firebase/admin";
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
import { InquiryReplyDialog } from "./inquiry-reply-dialog";
import type { Inquiry } from "@/lib/types";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  open: "未対応",
  in_progress: "対応中",
  resolved: "回答済み",
};

const statusColors: Record<string, string> = {
  open: "bg-red-100 text-red-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
};

export default async function AdminInquiriesPage() {
  const user = await requireAdmin();

  const db = adminDb();
  const snap = await db.collection("inquiries").orderBy("createdAt", "desc").get();
  const inquiries = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Inquiry));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header email={user.email} role={user.role} displayName={user.displayName} />
      <main className="container mx-auto px-4 py-8">
        <Link href="/admin" className="text-sm text-blue-600 hover:underline">
          &larr; 管理ダッシュボードに戻る
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
                      {new Date(inq.createdAt).toLocaleString("ja-JP")}
                    </TableCell>
                    <TableCell className="text-sm">{inq.userEmail}</TableCell>
                    <TableCell className="font-medium">{inq.subject}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-gray-600">
                      {inq.message}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[inq.status] ?? statusColors.open}>
                        {statusLabels[inq.status] ?? inq.status}
                      </Badge>
                      {inq.repliedAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          {inq.repliedBy} が回答
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <InquiryReplyDialog
                          inquiryId={inq.id}
                          subject={inq.subject}
                          message={inq.message}
                          existingReply={inq.replyMessage}
                        />
                        <InquiryStatusButton
                          inquiryId={inq.id}
                          currentStatus={inq.status}
                        />
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
