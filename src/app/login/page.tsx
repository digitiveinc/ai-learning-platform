"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { buildLoginEmail } from "@/lib/login-id";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginTab = "id" | "google";

export default function LoginPage() {
  const [tab, setTab] = useState<LoginTab>("id");
  const [companyId, setCompanyId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const callLoginApi = async (idToken: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "ログインに失敗しました");
  };

  const handleIdLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const loginEmail = buildLoginEmail(companyId.trim(), employeeId.trim());
      const result = await signInWithEmailAndPassword(auth, loginEmail, password);
      const idToken = await result.user.getIdToken();
      await callLoginApi(idToken);
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("auth/invalid-credential") || msg.includes("auth/wrong-password") || msg.includes("auth/user-not-found")) {
        setError("企業ID・ユーザーID・パスワードが正しくありません");
      } else if (msg.includes("ログインに失敗") || msg.includes("登録されていません")) {
        setError(msg);
      } else {
        setError("ログインに失敗しました。もう一度お試しください。");
      }
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      await callLoginApi(idToken);
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("popup-closed")) {
        setError("ログインがキャンセルされました");
      } else if (msg.includes("登録されていません")) {
        setError(msg);
      } else {
        setError("ログインに失敗しました。もう一度お試しください。");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 text-white p-12 flex-col justify-between">
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <div className="absolute top-20 right-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-56 h-56 bg-violet-500/15 rounded-full blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg">
            <span className="text-white text-lg font-bold">d</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">digitive</h1>
            <p className="text-indigo-300 text-xs">AI Learning Platform</p>
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
            {[["3", "学習レベル"], ["24/7", "いつでも学習"], ["100%", "進捗管理"]].map(([val, label]) => (
              <div key={label} className="bg-white/5 backdrop-blur-sm rounded-xl px-5 py-4 border border-white/10">
                <p className="text-3xl font-bold bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">{val}</p>
                <p className="text-slate-400 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-slate-500 text-xs">&copy; 2026 digitive inc.</p>
      </div>

      {/* Right login */}
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
            <CardHeader className="pb-2 text-center">
              <h2 className="text-2xl font-semibold">ログイン</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tab */}
              <div className="flex rounded-lg bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => { setTab("id"); setError(""); }}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                    tab === "id"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  IDでログイン
                </button>
                <button
                  type="button"
                  onClick={() => { setTab("google"); setError(""); }}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                    tab === "google"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Googleでログイン
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {tab === "id" ? (
                <form onSubmit={handleIdLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="companyId">企業ID</Label>
                    <Input
                      id="companyId"
                      placeholder="例: DGT001"
                      value={companyId}
                      onChange={(e) => setCompanyId(e.target.value)}
                      required
                      autoComplete="organization"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="employeeId">ユーザーID</Label>
                    <Input
                      id="employeeId"
                      placeholder="例: ADMIN001"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      required
                      autoComplete="username"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password">パスワード</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="パスワードを入力"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {loading ? "ログイン中..." : "ログイン"}
                  </Button>
                </form>
              ) : (
                <div className="space-y-3">
                  <p className="text-center text-sm text-gray-500">
                    会社のGoogleアカウントでログインしてください
                  </p>
                  <Button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full h-12 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm flex items-center justify-center gap-3"
                    variant="outline"
                  >
                    {loading ? (
                      <span className="text-sm">ログイン中...</span>
                    ) : (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span className="text-sm font-medium">Googleでログイン</span>
                      </>
                    )}
                  </Button>
                  <p className="text-center text-xs text-gray-400">
                    ※ 管理者から許可されたGoogleアカウントのみログイン可能です
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
