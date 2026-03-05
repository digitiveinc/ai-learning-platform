"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  userName: string;
};

export function InquiryForm({ userName }: Props) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "送信に失敗しました");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setSubject("");
    setMessage("");
    setLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="inquiry-name">お名前</Label>
        <Input
          id="inquiry-name"
          value={userName}
          disabled
          className="bg-slate-100"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="inquiry-subject">件名</Label>
        <Input
          id="inquiry-subject"
          placeholder="例: 動画の再生について"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="inquiry-message">お問い合わせ内容</Label>
        <Textarea
          id="inquiry-message"
          placeholder="お問い合わせ内容を入力してください"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          required
        />
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <p className="text-sm text-green-700">問い合わせを送信しました。担当者からの回答をお待ちください。</p>
        </div>
      )}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "送信中..." : "送信する"}
      </Button>
    </form>
  );
}
