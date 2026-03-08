"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ArchiveDeleteButton({
  archiveId,
  title,
}: {
  archiveId: string;
  title: string;
}) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`「${title}」を削除しますか？この操作は取り消せません。`)) return;

    const res = await fetch(`/api/admin/archives/${archiveId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("削除に失敗しました");
      return;
    }

    router.refresh();
  };

  return (
    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={handleDelete}>
      削除
    </Button>
  );
}
