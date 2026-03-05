"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Inquiry } from "@/lib/types";

const statusLabels: Record<string, string> = {
  open: "受付中",
  in_progress: "対応中",
  resolved: "回答済み",
};

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
};

export function InquiryHistory() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/inquiries?mode=mine")
      .then((res) => res.json())
      .then((data) => setInquiries(data.inquiries || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>お問い合わせ履歴</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">読み込み中...</p>
        </CardContent>
      </Card>
    );
  }

  if (inquiries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>お問い合わせ履歴</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">まだお問い合わせはありません。</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>お問い合わせ履歴</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {inquiries.map((inq) => (
          <div key={inq.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{inq.subject}</h3>
              <Badge className={statusColors[inq.status]}>
                {statusLabels[inq.status]}
              </Badge>
            </div>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{inq.message}</p>
            <p className="text-xs text-slate-400">
              {new Date(inq.created_at).toLocaleString("ja-JP")}
            </p>

            {/* 回答表示 */}
            {inq.reply_message && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mt-2 space-y-2">
                <p className="text-xs font-medium text-slate-500">担当者からの回答</p>
                <p className="text-sm whitespace-pre-wrap">{inq.reply_message}</p>
                {inq.reply_phone && (
                  <p className="text-sm">
                    <span className="text-slate-500">連絡先: </span>
                    <a href={`tel:${inq.reply_phone}`} className="text-blue-600 font-medium">
                      {inq.reply_phone}
                    </a>
                  </p>
                )}
                {inq.replied_at && (
                  <p className="text-xs text-slate-400">
                    回答日時: {new Date(inq.replied_at).toLocaleString("ja-JP")}
                    {inq.replied_by && ` (${inq.replied_by})`}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
