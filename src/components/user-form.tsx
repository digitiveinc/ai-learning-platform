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

type LoginType = "google" | "id";

type UserFormProps = {
  mode: "create" | "edit";
  currentRole?: string;
  initialData?: {
    id: string;
    email: string;
    displayName: string;
    level: string;
    accessMode: string;
    role: string;
    companyId?: string;
    employeeId?: string;
  };
};

export function UserForm({ mode, currentRole, initialData }: UserFormProps) {
  const hasIdLogin = !!(initialData?.companyId && initialData?.employeeId);
  const [loginType, setLoginType] = useState<LoginType>(
    mode === "edit" && hasIdLogin ? "id" : mode === "edit" ? "google" : "id"
  );
  const [email, setEmail] = useState(initialData?.email || "");
  const [companyId, setCompanyId] = useState(initialData?.companyId || "");
  const [employeeId, setEmployeeId] = useState(initialData?.employeeId || "");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState(initialData?.displayName || "");
  const [level, setLevel] = useState(initialData?.level || "beginner");
  const [accessMode, setAccessMode] = useState(initialData?.accessMode || "cumulative");
  const [role, setRole] = useState(initialData?.role || "user");
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
        const body =
          loginType === "id"
            ? { companyId, employeeId, password, displayName, level, accessMode, role }
            : { email, displayName, level, accessMode, role };

        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
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
          body: JSON.stringify({ displayName, level, accessMode, role }),
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
          {/* ログイン方式（新規作成時のみ） */}
          {mode === "create" && (
            <div className="space-y-2">
              <Label>ログイン方式</Label>
              <div className="flex rounded-lg bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => setLoginType("id")}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                    loginType === "id"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  企業ID・ユーザーID
                </button>
                <button
                  type="button"
                  onClick={() => setLoginType("google")}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                    loginType === "google"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Googleアカウント
                </button>
              </div>
            </div>
          )}

          {/* ID方式フィールド */}
          {loginType === "id" && mode === "create" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="companyId">企業ID</Label>
                <Input
                  id="companyId"
                  placeholder="例: DGT001"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeId">ユーザーID</Label>
                <Input
                  id="employeeId"
                  placeholder="例: ADMIN001"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">初期パスワード</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="初期パスワードを設定"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {/* Google方式フィールド */}
          {(loginType === "google" || mode === "edit") && (
            <>
              {mode === "edit" && hasIdLogin ? (
                <div className="space-y-2">
                  <Label>企業ID / ユーザーID</Label>
                  <div className="flex gap-2">
                    <Input value={initialData?.companyId || ""} disabled className="bg-gray-50" />
                    <Input value={initialData?.employeeId || ""} disabled className="bg-gray-50" />
                  </div>
                </div>
              ) : loginType === "google" || mode === "edit" ? (
                <div className="space-y-2">
                  <Label htmlFor="email">Googleアカウント（メールアドレス）</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={mode === "edit"}
                    required={mode === "create"}
                  />
                  {mode === "create" && (
                    <p className="text-xs text-slate-500">
                      ユーザーが初回ログイン時にこのメールアドレスで自動紐付けされます
                    </p>
                  )}
                </div>
              ) : null}
            </>
          )}

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

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading
                ? mode === "create" ? "作成中..." : "更新中..."
                : mode === "create" ? "ユーザーを作成" : "更新する"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/users")}>
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
