"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AccountSettingsDialog } from "@/components/account-settings-dialog";

type IchimonkaiHeaderProps = {
  email: string;
  role: string;
  employeeId?: string;
  displayName?: string;
};

export function IchimonkaiHeader({ email, role, employeeId, displayName }: IchimonkaiHeaderProps) {
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const shownName = displayName || employeeId || email.split("@")[0].toUpperCase();
  const initial = shownName.charAt(0).toUpperCase();

  return (
    <>
      <header
        className="sticky top-0 z-50"
        style={{
          background: "var(--ik-brown-dark)",
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)",
          padding: "0 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "72px",
          borderBottom: "3px solid var(--ik-amber)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
        }}
      >
        {/* ロゴ */}
        <Link
          href="/ichimonkai"
          style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              background: "var(--ik-amber)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-noto-serif), serif",
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--ik-brown-dark)",
              boxShadow: "0 0 0 2px var(--ik-amber-light)",
              flexShrink: 0,
            }}
          >
            門
          </div>
          <div>
            <span
              style={{
                fontFamily: "var(--font-noto-serif), serif",
                fontSize: "22px",
                fontWeight: 700,
                color: "var(--ik-cream)",
                letterSpacing: "0.12em",
                display: "block",
              }}
            >
              一門会
            </span>
            <span
              style={{
                fontSize: "10px",
                color: "var(--ik-amber-light)",
                letterSpacing: "0.2em",
                display: "block",
                marginTop: "2px",
              }}
            >
              ICHIMONKAI GUILD
            </span>
          </div>
        </Link>

        {/* 右側 */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span
            style={{
              background: "var(--ik-amber)",
              color: "var(--ik-brown-dark)",
              fontSize: "11px",
              fontWeight: 700,
              padding: "4px 12px",
              borderRadius: "20px",
              letterSpacing: "0.1em",
            }}
          >
            会員専用
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                style={{
                  width: "36px",
                  height: "36px",
                  background: "var(--ik-brown-mid)",
                  borderRadius: "50%",
                  border: "2px solid var(--ik-amber)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--ik-cream)",
                  fontSize: "14px",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                {initial}
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
                アカウント設定
              </DropdownMenuItem>
              {(role === "admin" || role === "superadmin") && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => router.push("/admin")}>
                    管理画面
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={handleLogout}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
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
