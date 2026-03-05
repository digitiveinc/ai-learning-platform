import Link from "next/link";
import { requireAuth } from "@/lib/appwrite/auth-guard";
import { getUserEmployeeId } from "@/lib/appwrite/server";
import { Header } from "@/components/header";
import { InquiryForm } from "@/components/inquiry-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const NOTEBOOK_LM_URL =
  "https://notebooklm.google.com/notebook/db3bc1b8-2163-407c-aab7-998b8b4e3eeb";

export default async function InquiryPage() {
  const { user, role } = await requireAuth();
  const employeeId = await getUserEmployeeId(user.$id);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header email={user.email} role={role} employeeId={employeeId} />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            &larr; ダッシュボードに戻る
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">サポート</h1>

        <div className="grid gap-6">
          {/* NotebookLM AI Bot */}
          <Card>
            <CardHeader>
              <CardTitle>AI アシスタント</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                まずはAIアシスタントにご質問ください。研修内容やプラットフォームの使い方について回答します。
              </p>
              <a
                href={NOTEBOOK_LM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm"
              >
                AIアシスタントを開く
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </CardContent>
          </Card>

          {/* 担当者への問い合わせ */}
          <Card>
            <CardHeader>
              <CardTitle>担当者への問い合わせ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                AIアシスタントで解決しない場合は、担当者に直接お問い合わせください。
              </p>
              <InquiryForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
