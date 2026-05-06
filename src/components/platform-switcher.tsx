"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function PlatformSwitcher() {
  const pathname = usePathname();
  const isIchimonkai = pathname.startsWith("/ichimonkai");

  return (
    <div
      style={{
        background: "#1e1e2e",
        borderBottom: "1px solid #333",
        display: "flex",
        justifyContent: "center",
        gap: "4px",
        padding: "6px 16px",
      }}
    >
      <Link
        href="/"
        style={{
          padding: "5px 18px",
          borderRadius: "6px",
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "0.05em",
          textDecoration: "none",
          background: !isIchimonkai ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "transparent",
          color: !isIchimonkai ? "#fff" : "#888",
          transition: "all 0.15s",
        }}
      >
        AI ラーニング
      </Link>
      <Link
        href="/ichimonkai"
        style={{
          padding: "5px 18px",
          borderRadius: "6px",
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "0.05em",
          textDecoration: "none",
          background: isIchimonkai ? "#c8872a" : "transparent",
          color: isIchimonkai ? "#3d1f0a" : "#888",
          transition: "all 0.15s",
        }}
      >
        一門会
      </Link>
    </div>
  );
}
