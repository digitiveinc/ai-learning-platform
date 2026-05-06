"use client";

import { useState, useMemo } from "react";
import { IchimonkaiArchiveCard } from "./ichimonkai-archive-card";

export type ArchiveDoc = {
  id: string;
  title: string;
  description?: string;
  youtubeId: string;
  thumbnailUrl?: string;
  createdAt: string;
};

type TabKey = "all" | "award" | "training" | "philosophy" | "company";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "動画一覧" },
  { key: "award", label: "表彰式" },
  { key: "training", label: "研修・技術" },
  { key: "philosophy", label: "社訓・理念" },
  { key: "company", label: "会社紹介" },
];

function categorize(archive: ArchiveDoc): TabKey {
  const text = (
    (archive.title || "") +
    " " +
    (archive.description || "")
  ).toLowerCase();
  if (text.includes("表彰") || text.includes("受賞") || text.includes("mvp"))
    return "award";
  if (
    text.includes("研修") ||
    text.includes("技術") ||
    text.includes("基本") ||
    text.includes("揚げ") ||
    text.includes("調理") ||
    text.includes("マニュアル")
  )
    return "training";
  if (
    text.includes("社訓") ||
    text.includes("理念") ||
    text.includes("十箇条") ||
    text.includes("想い") ||
    text.includes("哲学")
  )
    return "philosophy";
  if (
    text.includes("会社") ||
    text.includes("紹介") ||
    text.includes("入社") ||
    text.includes("会長") ||
    text.includes("代表")
  )
    return "company";
  return "all";
}

export function ArchiveTabs({ archives }: { archives: ArchiveDoc[] }) {
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const filtered = useMemo(() => {
    if (activeTab === "all") return archives;
    return archives.filter((a) => categorize(a) === activeTab);
  }, [archives, activeTab]);

  return (
    <>
      {/* タブナビゲーション */}
      <nav
        style={{
          background: "var(--ik-cream-dark)",
          borderBottom: "2px solid var(--ik-gold)",
          padding: "0 40px",
          display: "flex",
          gap: "4px",
          overflowX: "auto",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: "block",
              padding: "14px 24px",
              fontSize: "13px",
              fontWeight: activeTab === tab.key ? 700 : 500,
              color:
                activeTab === tab.key
                  ? "var(--ik-brown-dark)"
                  : "var(--ik-brown-mid)",
              letterSpacing: "0.08em",
              borderBottom:
                activeTab === tab.key
                  ? "3px solid var(--ik-amber)"
                  : "3px solid transparent",
              background: "none",
              cursor: "pointer",
              position: "relative",
              top: "2px",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
              outline: "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* メインコンテンツ */}
      <main
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "36px 40px 60px",
        }}
      >
        {/* セクションタイトル */}
        <h2
          style={{
            fontFamily: "var(--font-noto-serif), serif",
            fontSize: "18px",
            fontWeight: 700,
            color: "var(--ik-brown-dark)",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "4px",
              height: "20px",
              background: "var(--ik-amber)",
              borderRadius: "2px",
            }}
          />
          {TABS.find((t) => t.key === activeTab)?.label ?? "動画一覧"}
        </h2>

        {filtered.length === 0 ? (
          /* 空の状態 */
          <div
            style={{
              textAlign: "center",
              padding: "80px 0",
              color: "var(--ik-gold)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-noto-serif), serif",
                fontSize: "40px",
                marginBottom: "12px",
                opacity: 0.4,
              }}
            >
              準備中
            </div>
            <p
              style={{
                fontSize: "13px",
                letterSpacing: "0.15em",
                opacity: 0.6,
              }}
            >
              コンテンツは近日公開予定です
            </p>
          </div>
        ) : (
          /* 動画グリッド */
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            style={{ gap: "24px" }}
          >
            {filtered.map((a) => (
              <IchimonkaiArchiveCard
                key={a.id}
                id={a.id}
                title={a.title}
                description={a.description || ""}
                youtubeId={a.youtubeId}
                thumbnailUrl={a.thumbnailUrl}
                createdAt={a.createdAt}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
