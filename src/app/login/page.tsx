"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LoginPage() {
  const [companyCode, setCompanyCode] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyCode, employeeId, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "ログインに失敗しました");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex">
      {/* 左側: ブランドエリア */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white p-12 flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">digitive</h1>
          <p className="text-slate-400 text-sm mt-1">AI Learning Platform</p>
        </div>
        <div className="space-y-6">
          <h2 className="text-4xl font-bold leading-tight">
            AI研修を、<br />もっとスマートに。
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed max-w-md">
            レベルに合わせた研修動画で、チーム全体のAIスキルを効率的に向上させましょう。
          </p>
          <div className="flex gap-8 pt-4">
            <div>
              <p className="text-3xl font-bold">3</p>
              <p className="text-slate-400 text-sm">学習レベル</p>
            </div>
            <div>
              <p className="text-3xl font-bold">24/7</p>
              <p className="text-slate-400 text-sm">いつでも学習</p>
            </div>
          </div>
        </div>
        <p className="text-slate-500 text-xs">&copy; 2026 digitive inc.</p>
      </div>

      {/* 右側: ログインフォーム */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">digitive</h1>
            <p className="text-gray-500 text-sm">AI Learning Platform</p>
          </div>

          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4">
              <h2 className="text-2xl font-semibold text-center">ログイン</h2>
              <p className="text-sm text-gray-500 text-center">企業コード・社員ID・パスワードを入力してください</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="companyCode">企業コード</Label>
                  <Input
                    id="companyCode"
                    type="text"
                    placeholder="例: DGT001"
                    value={companyCode}
                    onChange={(e) => setCompanyCode(e.target.value)}
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeId">社員ID</Label>
                  <Input
                    id="employeeId"
                    type="text"
                    placeholder="例: EMP001"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">パスワード</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="パスワードを入力"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11"
                    required
                  />
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white"
                  disabled={loading}
                >
                  {loading ? "ログイン中..." : "ログイン"}
                </Button>
              </form>
              <div className="mt-6 text-center text-sm text-gray-400">
                管理者から発行された企業コードと社員IDでログインしてください
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
