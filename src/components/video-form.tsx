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

type VideoFormProps = {
  video?: {
    id: string;
    title: string;
    youtubeUrl: string;
    level: string;
    description: string | null;
    sortOrder: number;
  };
};

export function VideoForm({ video }: VideoFormProps) {
  const [title, setTitle] = useState(video?.title || "");
  const [youtubeUrl, setYoutubeUrl] = useState(video?.youtubeUrl || "");
  const [level, setLevel] = useState<string>(video?.level || "beginner");
  const [description, setDescription] = useState(video?.description || "");
  const [sortOrder, setSortOrder] = useState(video?.sortOrder?.toString() || "0");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = {
      title,
      youtube_url: youtubeUrl,
      level,
      description,
      sort_order: parseInt(sortOrder) || 0,
    };

    const url = video ? `/api/videos/${video.id}` : "/api/videos";
    const method = video ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      setError(video ? "更新に失敗しました" : "登録に失敗しました");
      setLoading(false);
      return;
    }

    router.push("/admin/videos");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="title">タイトル</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="動画のタイトル"
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
        <Label htmlFor="level">レベル</Label>
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">初級</SelectItem>
            <SelectItem value="intermediate">中級</SelectItem>
            <SelectItem value="advanced">上級</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">説明</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="動画の説明"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sortOrder">表示順</Label>
        <Input
          id="sortOrder"
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          placeholder="0"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading
            ? video ? "更新中..." : "登録中..."
            : video ? "更新" : "登録"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/videos")}
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
}
