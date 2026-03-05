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
      {/* Left: Brand area */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 text-white p-12 flex-col justify-between">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        {/* Decorative blobs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-56 h-56 bg-violet-500/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl" />

        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg">
              <span className="text-white text-lg font-bold">d</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">digitive</h1>
              <p className="text-indigo-300 text-xs">AI Learning Platform</p>
            </div>
          </div>
        </div>

        <div className="relative space-y-8">
          <h2 className="text-4xl font-bold leading-tight">
            AI研修を、<br />
            もっと<span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">スマート</span>に。
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed max-w-md">
            レベルに合わせた研修動画で、チーム全体のAIスキルを効率的に向上させましょう。
          </p>
          <div className="flex gap-6 pt-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl px-5 py-4 border border-white/10">
              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">3</p>
              <p className="text-slate-400 text-sm mt-1">学習レベル</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl px-5 py-4 border border-white/10">
              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">24/7</p>
              <p className="text-slate-400 text-sm mt-1">いつでも学習</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl px-5 py-4 border border-white/10">
              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">100%</p>
              <p className="text-slate-400 text-sm mt-1">進捗管理</p>
            </div>
          </div>
        </div>

        <p className="relative text-slate-500 text-xs">&copy; 2026 digitive inc.</p>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">d</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">digitive</h1>
            </div>
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
                  className="w-full h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-sm"
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
