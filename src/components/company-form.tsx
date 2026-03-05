"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CompanyFormProps = {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    companyName: string;
    companyCode: string;
    isActive: boolean;
  };
};

export function CompanyForm({ mode, initialData }: CompanyFormProps) {
  const [companyName, setCompanyName] = useState(initialData?.companyName || "");
  const [companyCode, setCompanyCode] = useState(initialData?.companyCode || "");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "create") {
        const res = await fetch("/api/admin/companies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyName, companyCode }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "作成に失敗しました");
          setLoading(false);
          return;
        }
      } else {
        const res = await fetch(`/api/admin/companies/${initialData!.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyName, isActive }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "更新に失敗しました");
          setLoading(false);
          return;
        }
      }
      router.push("/admin/companies");
      router.refresh();
    } catch {
      setError("エラーが発生しました");
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>{mode === "create" ? "企業作成" : "企業編集"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="companyCode">企業コード</Label>
            <Input
              id="companyCode"
              placeholder="例: DGT001"
              value={companyCode}
              onChange={(e) => setCompanyCode(e.target.value)}
              disabled={mode === "edit"}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">企業名</Label>
            <Input
              id="companyName"
              placeholder="例: digitive株式会社"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>

          {mode === "edit" && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="isActive">有効</Label>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading
                ? mode === "create" ? "作成中..." : "更新中..."
                : mode === "create" ? "企業を作成" : "更新する"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/companies")}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
