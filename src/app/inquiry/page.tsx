import Link from "next/link";
import { requireAuth } from "@/lib/firebase/auth-guard";
import { Header } from "@/components/header";
import { InquiryForm } from "@/components/inquiry-form";
import { InquiryHistory } from "@/components/inquiry-history";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function InquiryPage() {
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <Header email={user.email} role={user.role} displayName={user.displayName} />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            &larr; ダッシュボードに戻る
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">お問い合わせ</h1>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>新しいお問い合わせ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                ご質問やお困りのことがあれば、下記フォームからお問い合わせください。担当者が確認し、回答いたします。
              </p>
              <InquiryForm userName={user.displayName} />
            </CardContent>
          </Card>

          <InquiryHistory />
        </div>
      </main>
    </div>
  );
}
