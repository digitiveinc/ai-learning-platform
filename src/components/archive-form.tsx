"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ArchiveFormProps = {
  archive?: {
    id: string;
    title: string;
    description: string;
    youtube_url: string;
    target_type: string;
    target_id: string;
  };
  currentRole: string;
  currentCompanyId?: string;
  companies: { id: string; company_name: string }[];
  users: { id: string; displayName: string; employeeId: string }[];
};

export function ArchiveForm({
  archive,
  currentRole,
  currentCompanyId,
  companies,
  users,
}: ArchiveFormProps) {
  const [title, setTitle] = useState(archive?.title || "");
  const [description, setDescription] = useState(archive?.description || "");
  const [youtubeUrl, setYoutubeUrl] = useState(archive?.youtube_url || "");
  const [targetType, setTargetType] = useState<string>(archive?.target_type || "company");
  const [targetId, setTargetId] = useState<string>(archive?.target_id || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // adminの場合、企業は自社固定
  const availableCompanies = currentRole === "superadmin"
    ? companies
    : companies.filter((c) => c.id === currentCompanyId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = {
      title,
      description,
      youtube_url: youtubeUrl,
      target_type: targetType,
      target_id: targetId,
    };

    const url = archive
      ? `/api/admin/archives/${archive.id}`
      : "/api/admin/archives";
    const method = archive ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) {
        setError(result.error || (archive ? "更新に失敗しました" : "作成に失敗しました"));
        setLoading(false);
        return;
      }

      router.push("/admin/archives");
      router.refresh();
    } catch {
      setError("エラーが発生しました");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="title">タイトル</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="アーカイブのタイトル"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="youtubeUrl">YouTube URL</Label>
        <Input
          id="youtubeUrl"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetType">対象種別</Label>
        <Select
          value={targetType}
          onValueChange={(v) => {
            setTargetType(v);
            setTargetId("");
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="company">企業</SelectItem>
            <SelectItem value="user">ユーザー</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetId">
          {targetType === "company" ? "対象企業" : "対象ユーザー"}
        </Label>
        <Select value={targetId} onValueChange={setTargetId}>
          <SelectTrigger>
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            {targetType === "company"
              ? availableCompanies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.company_name}
                  </SelectItem>
                ))
              : users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.displayName || u.employeeId}
                  </SelectItem>
                ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">説明</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="アーカイブの説明（任意）"
          rows={4}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={loading || !targetId}>
          {loading
            ? archive ? "更新中..." : "登録中..."
            : archive ? "更新" : "登録"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/archives")}
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
}
