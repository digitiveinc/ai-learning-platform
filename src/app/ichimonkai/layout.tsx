import type { Metadata } from "next";
import { Noto_Serif_JP, Noto_Sans_JP } from "next/font/google";

const notoSerifJP = Noto_Serif_JP({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  preload: false,
  variable: "--font-noto-serif",
});

const notoSansJP = Noto_Sans_JP({
  weight: ["400", "500"],
  subsets: ["latin"],
  preload: false,
  variable: "--font-noto-sans",
});

export const metadata: Metadata = {
  title: "一門会 | 動画アーカイブ",
  description: "一門会 会員専用 動画プラットフォーム",
};

export default function IchimonkaiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${notoSerifJP.variable} ${notoSansJP.variable}`}>
      {children}
    </div>
  );
}
