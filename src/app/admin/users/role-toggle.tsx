"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function RoleToggleButton({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const router = useRouter();

  const handleToggle = async () => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const action = newRole === "admin" ? "管理者に昇格" : "一般ユーザーに変更";

    if (!confirm(`このユーザーを${action}しますか？`)) return;

    const res = await fetch(`/api/users/${userId}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });

    if (!res.ok) {
      alert("ロールの変更に失敗しました");
      return;
    }

    router.refresh();
  };

  return (
    <Button variant="outline" size="sm" onClick={handleToggle}>
      {currentRole === "admin" ? "一般に変更" : "管理者に昇格"}
    </Button>
  );
}
