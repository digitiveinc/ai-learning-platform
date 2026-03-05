"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  inquiryId: string;
  subject: string;
  message: string;
  existingReply?: string;
};

export function InquiryReplyDialog({ inquiryId, subject, message, existingReply }: Props) {
  const [open, setOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState(existingReply || "");
  const [replyPhone, setReplyPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    setLoading(true);
    setError("");

    const res = await fetch(`/api/inquiries/${inquiryId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reply_message: replyMessage,
        reply_phone: replyPhone,
      }),
    });

    if (!res.ok) {
      setError("回答の送信に失敗しました");
      setLoading(false);
      return;
    }

    setLoading(false);
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={existingReply ? "outline" : "default"} size="sm">
          {existingReply ? "回答を編集" : "回答する"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>問い合わせに回答</DialogTitle>
        </DialogHeader>

        <div className="bg-slate-50 border rounded-lg p-3 space-y-1">
          <p className="text-xs text-slate-500">件名</p>
          <p className="text-sm font-medium">{subject}</p>
          <p className="text-xs text-slate-500 mt-2">内容</p>
          <p className="text-sm whitespace-pre-wrap">{message}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reply-message">回答内容</Label>
            <Textarea
              id="reply-message"
              placeholder="回答を入力してください"
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              rows={4}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reply-phone">連絡先電話番号（任意）</Label>
            <Input
              id="reply-phone"
              type="tel"
              placeholder="例: 03-1234-5678"
              value={replyPhone}
              onChange={(e) => setReplyPhone(e.target.value)}
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "送信中..." : "回答を送信"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
