"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminQuoteCreatePage() {
  const router = useRouter();
  const [publishDate, setPublishDate] = useState("");
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publishDate, text, author: author || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "保存に失敗しました");
      }

      router.push("/admin/quotes");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href="/admin/quotes" className="text-sm text-blue-600 hover:underline">
          ← 一言管理に戻る
        </Link>
        <h1 className="text-3xl font-bold mt-2 mb-8">今日の一言を追加</h1>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="publishDate">公開日 *</Label>
              <Input
                id="publishDate"
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                required
              />
              <p className="text-xs text-slate-500">
                この日付と一致した日に一門会ページに表示されます（YYYY-MM-DD 形式）
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="text">本文 *</Label>
              <Textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="今日の一言を入力してください"
                rows={5}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">著者（任意）</Label>
              <Input
                id="author"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="例: 代表取締役 山田太郎"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "保存中..." : "保存"}
              </Button>
              <Link href="/admin/quotes">
                <Button type="button" variant="outline">
                  キャンセル
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
