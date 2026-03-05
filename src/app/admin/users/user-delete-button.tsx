"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function UserDeleteButton({
  userId,
  employeeId,
}: {
  userId: string;
  employeeId: string;
}) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`${employeeId} を削除しますか？この操作は取り消せません。`)) return;

    const res = await fetch(`/api/admin/users/${userId}`, {
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
