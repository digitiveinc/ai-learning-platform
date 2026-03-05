"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CompanyOption = {
  id: string;
  company_name: string;
  company_code: string;
};

type UserFormProps = {
  mode: "create" | "edit";
  currentRole?: string;
  currentCompanyId?: string;
  companies?: CompanyOption[];
  initialData?: {
    id: string;
    employeeId: string;
    displayName: string;
    level: string;
    accessMode: string;
    role: string;
    companyId?: string;
  };
};

export function UserForm({ mode, currentRole, currentCompanyId, companies = [], initialData }: UserFormProps) {
  const [employeeId, setEmployeeId] = useState(initialData?.employeeId || "");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState(initialData?.displayName || "");
  const [level, setLevel] = useState(initialData?.level || "beginner");
  const [accessMode, setAccessMode] = useState(initialData?.accessMode || "cumulative");
  const [role, setRole] = useState(initialData?.role || "user");
  const [companyId, setCompanyId] = useState(initialData?.companyId || currentCompanyId || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isSuperAdmin = currentRole === "superadmin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "create") {
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employeeId, password, displayName, level, accessMode, companyId }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "作成に失敗しました");
          setLoading(false);
          return;
        }
      } else {
        const res = await fetch(`/api/admin/users/${initialData!.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName,
            level,
            accessMode,
            role,
            ...(password ? { password } : {}),
            ...(isSuperAdmin ? { companyId } : {}),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "更新に失敗しました");
          setLoading(false);
          return;
        }
      }
      router.push("/admin/users");
      router.refresh();
    } catch {
      setError("エラーが発生しました");
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>{mode === "create" ? "ユーザー作成" : "ユーザー編集"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {isSuperAdmin && companies.length > 0 && (
            <div className="space-y-2">
              <Label>企業</Label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger>
                  <SelectValue placeholder="企業を選択" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.company_code} - {c.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="employeeId">社員ID</Label>
            <Input
              id="employeeId"
              placeholder="例: EMP001"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              disabled={mode === "edit"}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">表示名</Label>
            <Input
              id="displayName"
              placeholder="例: 山田太郎"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              パスワード{mode === "edit" ? "（変更する場合のみ）" : ""}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="8文字以上"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={mode === "create"}
            />
          </div>

          <div className="space-y-2">
            <Label>レベル</Label>
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
            <Label>アクセスモード</Label>
            <Select value={accessMode} onValueChange={setAccessMode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cumulative">累積（割り当て以下すべて）</SelectItem>
                <SelectItem value="exact">限定（割り当てレベルのみ）</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mode === "edit" && (
            <div className="space-y-2">
              <Label>ロール</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">一般</SelectItem>
                  <SelectItem value="admin">管理者</SelectItem>
                  {isSuperAdmin && (
                    <SelectItem value="superadmin">スーパー管理者</SelectItem>
                  )}
                </SelectContent>
              </Select>
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
                ? mode === "create"
                  ? "作成中..."
                  : "更新中..."
                : mode === "create"
                  ? "ユーザーを作成"
                  : "更新する"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/users")}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
