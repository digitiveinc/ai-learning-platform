import Link from "next/link";
import Image from "next/image";

type IchimonkaiArchiveCardProps = {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  thumbnailUrl?: string;
  createdAt?: string;
};

function getCategoryInfo(title: string, description: string) {
  const text = ((title || "") + " " + (description || "")).toLowerCase();
  if (text.includes("表彰") || text.includes("受賞") || text.includes("mvp"))
    return { label: "表彰式", kanji: "表彰" };
  if (
    text.includes("研修") ||
    text.includes("技術") ||
    text.includes("基本") ||
    text.includes("揚げ") ||
    text.includes("調理") ||
    text.includes("マニュアル")
  )
    return { label: "研修・技術", kanji: "技術" };
  if (
    text.includes("社訓") ||
    text.includes("理念") ||
    text.includes("十箇条") ||
    text.includes("想い") ||
    text.includes("哲学")
  )
    return { label: "社訓・理念", kanji: "社訓" };
  if (
    text.includes("会社") ||
    text.includes("紹介") ||
    text.includes("入社") ||
    text.includes("会長") ||
    text.includes("代表")
  )
    return { label: "会社紹介", kanji: "会社" };
  return { label: "アーカイブ", kanji: "動画" };
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export function IchimonkaiArchiveCard({
  id,
  title,
  description,
  youtubeId,
  thumbnailUrl,
  createdAt,
}: IchimonkaiArchiveCardProps) {
  const thumbnailSrc =
    thumbnailUrl ||
    (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null);
  const { label, kanji } = getCategoryInfo(title, description);

  return (
    <Link href={`/archives/${id}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
      <div
        className="group"
        style={{
          background: "var(--ik-card-bg)",
          borderRadius: "10px",
          overflow: "hidden",
          boxShadow:
            "0 2px 8px rgba(61,31,10,0.12), 0 0 0 1px rgba(184,146,74,0.2)",
          transition: "transform 0.2s, box-shadow 0.2s",
          cursor: "pointer",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* サムネイル */}
        <div
          style={{
            position: "relative",
            width: "100%",
            paddingTop: "56.25%",
            background: "var(--ik-brown-dark)",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {thumbnailSrc ? (
            <Image
              src={thumbnailSrc}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              style={{ opacity: 0.85 }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(135deg, var(--ik-brown-dark) 0%, var(--ik-brown-mid) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-noto-serif), serif",
                  fontSize: "32px",
                  color: "rgba(245,237,216,0.15)",
                  letterSpacing: "0.2em",
                }}
              >
                {kanji}
              </span>
            </div>
          )}

          {/* 再生ボタン */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "52px",
              height: "52px",
              background: "rgba(200,135,42,0.9)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="16"
              height="18"
              viewBox="0 0 16 18"
              fill="var(--ik-brown-dark)"
              style={{ marginLeft: "3px" }}
            >
              <path d="M0 0L16 9L0 18V0Z" />
            </svg>
          </div>
        </div>

        {/* カード本体 */}
        <div
          style={{
            padding: "14px 16px 16px",
            borderTop: "1px solid var(--ik-cream-dark)",
            flex: 1,
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "var(--ik-amber)",
              letterSpacing: "0.15em",
              marginBottom: "6px",
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontFamily: "var(--font-noto-serif), serif",
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--ik-brown-dark)",
              lineHeight: 1.5,
              marginBottom: "8px",
            }}
          >
            {title}
          </div>
          {createdAt && (
            <div style={{ fontSize: "11px", color: "var(--ik-gold)" }}>
              {formatDate(createdAt)}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
