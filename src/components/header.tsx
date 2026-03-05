"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PasswordChangeDialog } from "@/components/password-change-dialog";

type HeaderProps = {
  email: string;
  role: string;
  employeeId?: string;
};

export function Header({ email, role, employeeId }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const displayId = employeeId || email.split("@")[0].toUpperCase();
  const initial = displayId.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <span className="text-white text-sm font-bold">d</span>
            </div>
            <span className="text-lg font-bold text-gray-900">研修動画</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              ダッシュボード
            </Link>
            <Link
              href="/inquiry"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              サポート
            </Link>
            {(role === "admin" || role === "superadmin") && (
              <Link
                href="/admin"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                管理
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
              <span className="text-slate-600 text-sm font-semibold">{initial}</span>
            </div>
            <span className="text-sm text-gray-600 font-mono">{displayId}</span>
          </div>
          <PasswordChangeDialog />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-500 hover:text-gray-700"
          >
            ログアウト
          </Button>
        </div>
      </div>
    </header>
  );
}
