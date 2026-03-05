"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function InquiryForm() {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

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
    setTimeout(() => {
      setOpen(false);
      setSuccess(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); setError(""); setSuccess(false); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          担当者に問い合わせる
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>問い合わせ</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
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
            <Label htmlFor="inquiry-message">メッセージ</Label>
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
              <p className="text-sm text-green-700">問い合わせを送信しました</p>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "送信中..." : "送信する"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
