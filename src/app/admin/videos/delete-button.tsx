"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DeleteVideoButton({ videoId, videoTitle }: { videoId: string; videoTitle: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`「${videoTitle}」を削除してもよろしいですか？`)) return;

    const res = await fetch(`/api/videos/${videoId}`, { method: "DELETE" });

    if (!res.ok) {
      alert("削除に失敗しました");
      return;
    }

    router.refresh();
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete}>
      削除
    </Button>
  );
}
