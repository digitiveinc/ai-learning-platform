"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AccountSettingsDialog } from "@/components/account-settings-dialog";

type HeaderProps = {
  email: string;
  role: string;
  employeeId?: string;
  displayName?: string;
};

export function Header({ email, role, employeeId, displayName }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const shownName = displayName || employeeId || email.split("@")[0].toUpperCase();
  const initial = shownName.charAt(0).toUpperCase();

  const navItems = [
    { href: "/", label: "ダッシュボード", match: (p: string) => p === "/" },
    { href: "/inquiry", label: "サポート", match: (p: string) => p.startsWith("/inquiry") },
    ...(role === "admin" || role === "superadmin"
      ? [{ href: "/admin", label: "管理", match: (p: string) => p.startsWith("/admin") }]
      : []),
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm">
                <span className="text-white text-sm font-bold">d</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                研修動画
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = item.match(pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "text-indigo-700 bg-indigo-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-indigo-600 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-3 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">{initial}</span>
                </div>
                <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[120px] truncate">
                  {shownName}
                </span>
                <svg className="hidden sm:block w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{shownName}</p>
                  <p className="text-xs text-muted-foreground">{employeeId || email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setSettingsOpen(true)}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                アカウント設定
              </DropdownMenuItem>
              {/* Mobile nav */}
              <div className="md:hidden">
                <DropdownMenuSeparator />
                {navItems.map((item) => (
                  <DropdownMenuItem key={item.href} onSelect={() => router.push(item.href)}>
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={handleLogout}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                ログアウト
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <AccountSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        currentDisplayName={shownName}
      />
    </>
  );
}
