import { requireAuth } from "@/lib/firebase/auth-guard";
import { adminDb } from "@/lib/firebase/admin";
import { IchimonkaiHeader } from "@/components/ichimonkai-header";
import { ArchiveTabs } from "@/components/archive-tabs";
import type { ArchiveDoc } from "@/components/archive-tabs";
import type { Archive, Quote } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function IchimonkaiPage() {
  const user = await requireAuth();

  const db = adminDb();

  // 今日の一言
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const quoteDoc = await db.collection("quotes").doc(today).get();
  const quote: Quote | null = quoteDoc.exists
    ? ({ id: quoteDoc.id, ...quoteDoc.data() } as Quote)
    : null;

  // アーカイブ（全件）
  const archivesSnap = await db.collection("archives").orderBy("createdAt", "desc").get();
  const archives: ArchiveDoc[] = archivesSnap.docs.map((d) => {
    const data = d.data() as Archive;
    return {
      id: d.id,
      title: data.title,
      description: data.description,
      youtubeId: data.youtubeId,
      thumbnailUrl: data.thumbnailUrl,
      createdAt: data.createdAt,
    };
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--ik-cream)",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
        fontFamily:
          "var(--font-noto-sans), 'Hiragino Kaku Gothic ProN', sans-serif",
        color: "var(--ik-charcoal)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <IchimonkaiHeader
        email={user.email}
        role={user.role}
        displayName={user.displayName}
      />

      {/* 今日の一言 */}
      {quote && (
        <div
          style={{
            background: "var(--ik-brown-dark)",
            borderBottom: "1px solid var(--ik-amber)",
            padding: "20px 40px",
          }}
        >
          <div
            style={{
              maxWidth: "1100px",
              margin: "0 auto",
              display: "flex",
              alignItems: "flex-start",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "3px",
                height: "40px",
                background: "var(--ik-amber)",
                flexShrink: 0,
                marginTop: "4px",
              }}
            />
            <div>
              <p
                style={{
                  fontSize: "10px",
                  color: "var(--ik-amber-light)",
                  letterSpacing: "0.2em",
                  marginBottom: "6px",
                  fontWeight: 700,
                }}
              >
                今日の一言
              </p>
              <p
                style={{
                  fontFamily: "var(--font-noto-serif), serif",
                  fontSize: "16px",
                  color: "var(--ik-cream)",
                  lineHeight: 1.8,
                }}
              >
                {quote.text}
              </p>
              {quote.author && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--ik-gold)",
                    marginTop: "8px",
                    letterSpacing: "0.1em",
                  }}
                >
                  — {quote.author}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ flex: 1 }}>
        <ArchiveTabs archives={archives} />
      </div>

      <footer
        style={{
          background: "var(--ik-brown-dark)",
          borderTop: "2px solid var(--ik-amber)",
          padding: "24px 40px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: "rgba(245,237,216,0.5)",
            fontSize: "11px",
            letterSpacing: "0.1em",
          }}
        >
          © 一門会 Ichimonkai Guild
          {(user.role === "admin" || user.role === "superadmin") && (
            <>
              　｜
              <a
                href="/admin"
                style={{ color: "var(--ik-amber-light)", textDecoration: "none" }}
              >
                管理画面
              </a>
            </>
          )}
        </p>
      </footer>
    </div>
  );
}
