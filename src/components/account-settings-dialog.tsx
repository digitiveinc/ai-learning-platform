"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Tab = "profile" | "password";

type AccountSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDisplayName: string;
};

export function AccountSettingsDialog({
  open,
  onOpenChange,
  currentDisplayName,
}: AccountSettingsDialogProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profile");

  // Profile state
  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleOpenChange = (v: boolean) => {
    onOpenChange(v);
    if (!v) {
      setProfileError("");
      setProfileSuccess(false);
      setPasswordError("");
      setPasswordSuccess(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess(false);

    const trimmed = displayName.trim();
    if (!trimmed) {
      setProfileError("表示名を入力してください");
      return;
    }
    if (trimmed.length > 50) {
      setProfileError("表示名は50文字以内で入力してください");
      return;
    }

    setProfileLoading(true);
    const res = await fetch("/api/auth/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: trimmed }),
    });

    if (!res.ok) {
      const data = await res.json();
      setProfileError(data.error || "更新に失敗しました");
      setProfileLoading(false);
      return;
    }

    setProfileSuccess(true);
    setProfileLoading(false);
    setTimeout(() => {
      handleOpenChange(false);
      router.refresh();
    }, 1500);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("新しいパスワードが一致しません");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("新しいパスワードは8文字以上で入力してください");
      return;
    }

    setPasswordLoading(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!res.ok) {
      const data = await res.json();
      setPasswordError(data.error || "変更に失敗しました");
      setPasswordLoading(false);
      return;
    }

    setPasswordSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordLoading(false);
    setTimeout(() => handleOpenChange(false), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>アカウント設定</DialogTitle>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setTab("profile")}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === "profile"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            プロフィール
          </button>
          <button
            type="button"
            onClick={() => setTab("password")}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === "password"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            パスワード
          </button>
        </div>

        {/* Profile tab */}
        {tab === "profile" && (
          <form onSubmit={handleProfileSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="displayName">表示名</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="表示名を入力"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
              <p className="text-xs text-slate-400">
                ヘッダーやお問い合わせに表示される名前です
              </p>
            </div>
            {profileError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-sm text-red-700">{profileError}</p>
              </div>
            )}
            {profileSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                <p className="text-sm text-green-700">表示名を更新しました</p>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={profileLoading}>
              {profileLoading ? "更新中..." : "表示名を更新"}
            </Button>
          </form>
        )}

        {/* Password tab */}
        {tab === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="settingsCurrentPw">現在のパスワード</Label>
              <Input
                id="settingsCurrentPw"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settingsNewPw">新しいパスワード</Label>
              <Input
                id="settingsNewPw"
                type="password"
                placeholder="8文字以上"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settingsConfirmPw">新しいパスワード（確認）</Label>
              <Input
                id="settingsConfirmPw"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {passwordError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-sm text-red-700">{passwordError}</p>
              </div>
            )}
            {passwordSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                <p className="text-sm text-green-700">パスワードを変更しました</p>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={passwordLoading}>
              {passwordLoading ? "変更中..." : "パスワードを変更"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
