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
import { extractYouTubeId } from "@/lib/youtube";

const THUMBNAIL_OPTIONS = [
  { label: "AI基礎研修", value: "/thumbnails/ai-basics.svg" },
  { label: "プロンプトエンジニアリング", value: "/thumbnails/prompt-engineering.svg" },
  { label: "Copilot活用法", value: "/thumbnails/chatgpt-usage.svg" },
  { label: "AIビジネス活用", value: "/thumbnails/ai-business.svg" },
  { label: "機械学習入門", value: "/thumbnails/machine-learning.svg" },
  { label: "AI倫理・リスク管理", value: "/thumbnails/ai-ethics.svg" },
  { label: "生成AI概論", value: "/thumbnails/generative-ai.svg" },
  { label: "Copilot実践（オフライン研修）", value: "/thumbnails/ai-tools.svg" },
  { label: "AI×DX推進", value: "/thumbnails/ai-dx.svg" },
  { label: "AIデータ分析", value: "/thumbnails/data-analysis.svg" },
];

type ArchiveFormProps = {
  archive?: {
    id: string;
    title: string;
    description: string;
    youtubeId: string;
    thumbnailUrl?: string;
  };
};

export function ArchiveForm({ archive }: ArchiveFormProps) {
  const [title, setTitle] = useState(archive?.title || "");
  const [description, setDescription] = useState(archive?.description || "");
  const [youtubeUrl, setYoutubeUrl] = useState(
    archive?.youtubeId ? `https://www.youtube.com/watch?v=${archive.youtubeId}` : ""
  );
  const [thumbnailUrl, setThumbnailUrl] = useState(archive?.thumbnailUrl || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const youtubeId = extractYouTubeId(youtubeUrl);
    if (!youtubeId) {
      setError("有効な YouTube URL を入力してください");
      setLoading(false);
      return;
    }

    const data = {
      title,
      description,
      youtubeId,
      thumbnailUrl: thumbnailUrl !== "none" ? thumbnailUrl : "",
    };

    const url = archive ? `/api/admin/archives/${archive.id}` : "/api/admin/archives";
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
        <Label htmlFor="youtubeUrl">YouTube URL（限定公開）</Label>
        <Input
          id="youtubeUrl"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          required
        />
      </div>

      <div className="space-y-3">
        <Label>サムネイル画像</Label>
        <div className="space-y-2">
          <Select value={thumbnailUrl} onValueChange={setThumbnailUrl}>
            <SelectTrigger>
              <SelectValue placeholder="プリセットから選択（任意）" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">YouTube既定サムネイル</SelectItem>
              {THUMBNAIL_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="または画像URLを直接入力（/thumbnails/xxx.svg など）"
          />
        </div>
        {thumbnailUrl && thumbnailUrl !== "none" && (
          <div className="border rounded-lg overflow-hidden w-64">
            <img src={thumbnailUrl} alt="サムネイルプレビュー" className="w-full aspect-video object-cover" />
          </div>
        )}
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
        <Button type="submit" disabled={loading}>
          {loading ? (archive ? "更新中..." : "登録中...") : archive ? "更新" : "登録"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/archives")}>
          キャンセル
        </Button>
      </div>
    </form>
  );
}
