/**
 * 動画27本の一括登録スクリプト
 *
 * 使い方:
 *   npx tsx scripts/seed-videos.ts
 *
 * 事前に .env.local の環境変数が設定されていること。
 * 既存の動画がある場合は重複チェック（タイトル一致）でスキップします。
 */

import { Client, Databases, ID, Query } from "node-appwrite";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const API_KEY = process.env.APPWRITE_API_KEY!;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const VIDEOS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_VIDEOS_COLLECTION_ID!;

type VideoSeed = {
  title: string;
  youtube_url: string;
  level: "beginner" | "intermediate" | "advanced";
  sort_order: number;
  description: string;
};

const videos: VideoSeed[] = [
  // ── 初級（11本） ──
  {
    title: "自己紹介&このチャンネルについて",
    youtube_url: "https://www.youtube.com/watch?v=xOBFMIh1B1A",
    level: "beginner",
    sort_order: 1,
    description: "チャンネル紹介と自己紹介です。",
  },
  {
    title: "AI初級編！ChatGPTと議論や相談をしてみよう！",
    youtube_url: "https://www.youtube.com/watch?v=rGdBCOsNGmI",
    level: "beginner",
    sort_order: 2,
    description: "ChatGPTを使った議論や相談の方法を学びます。",
  },
  {
    title: "Canvaのテンプレを使ってデザインを作ってみよう！",
    youtube_url: "https://www.youtube.com/watch?v=RwO2sXAiMmE",
    level: "beginner",
    sort_order: 3,
    description: "Canvaのテンプレートを使ったデザイン作成入門。",
  },
  {
    title: "初めてのチラシ・ポスター作り",
    youtube_url: "https://www.youtube.com/watch?v=s5uieLIMv7U",
    level: "beginner",
    sort_order: 4,
    description: "AIを活用したチラシ・ポスター作成の基本。",
  },
  {
    title: "5分でPOPを作ってみよう！",
    youtube_url: "https://www.youtube.com/watch?v=PFW6u3EGskc",
    level: "beginner",
    sort_order: 5,
    description: "短時間でPOPを作成する方法を紹介。",
  },
  {
    title: "CapCutとAIで簡単に字幕をつける",
    youtube_url: "https://www.youtube.com/watch?v=_PZNGtTa80s",
    level: "beginner",
    sort_order: 6,
    description: "CapCutとAIを組み合わせた字幕付けの方法。",
  },
  {
    title: "Notion初心者に送る 初めてのNotion活用術",
    youtube_url: "https://www.youtube.com/watch?v=xI-6WIID92c",
    level: "beginner",
    sort_order: 7,
    description: "Notion初心者向けの基本的な使い方。",
  },
  {
    title: "どのAIを使えばいい？",
    youtube_url: "https://www.youtube.com/watch?v=7lBc-GR51hk",
    level: "beginner",
    sort_order: 8,
    description: "目的に合ったAIツールの選び方。",
  },
  {
    title: "ChatGPTしか知らない はもう古い？",
    youtube_url: "https://www.youtube.com/watch?v=gLjjKUebGRM",
    level: "beginner",
    sort_order: 9,
    description: "ChatGPT以外のAIツールについて紹介。",
  },
  {
    title: "iPhone17発表！Apple AIのアップデートは！？",
    youtube_url: "https://www.youtube.com/watch?v=Qlhoh1IXYF8",
    level: "beginner",
    sort_order: 10,
    description: "Apple AIの最新アップデート情報。",
  },
  {
    title: "仕事中にLINEのAIいじってたら",
    youtube_url: "https://www.youtube.com/watch?v=WFIBuv9grIU",
    level: "beginner",
    sort_order: 11,
    description: "LINEのAI機能を仕事で活用する方法。",
  },

  // ── 中級（10本） ──
  {
    title: "Notionでタスク管理！プロジェクト管理表との連携",
    youtube_url: "https://www.youtube.com/watch?v=2bEJoxfaFvY",
    level: "intermediate",
    sort_order: 1,
    description: "Notionを使ったタスク管理とプロジェクト管理表の連携方法。",
  },
  {
    title: "Notionでプロジェクト管理表を作ろう！",
    youtube_url: "https://www.youtube.com/watch?v=E3LPJgm7PsA",
    level: "intermediate",
    sort_order: 2,
    description: "Notionでプロジェクト管理表を作成する実践ガイド。",
  },
  {
    title: "Notionで議事録&メモを時短かつキレイに",
    youtube_url: "https://www.youtube.com/watch?v=xfhOPhmzF4k",
    level: "intermediate",
    sort_order: 3,
    description: "Notionを使った効率的な議事録作成術。",
  },
  {
    title: "Notion 共有カレンダーをWebページとして公開",
    youtube_url: "https://www.youtube.com/watch?v=3VD3TtBeVG8",
    level: "intermediate",
    sort_order: 4,
    description: "Notionの共有カレンダーをWebページとして公開する方法。",
  },
  {
    title: "会議にAIを入れるだけで tl;dv",
    youtube_url: "https://www.youtube.com/watch?v=sBfK6d0sSFs",
    level: "intermediate",
    sort_order: 5,
    description: "AI議事録ツールtl;dvの活用法。",
  },
  {
    title: "ChatGPTの時代終了。Geminiが最強説",
    youtube_url: "https://www.youtube.com/watch?v=K3nMtHrmFjk",
    level: "intermediate",
    sort_order: 6,
    description: "Google Geminiの実力とChatGPTとの比較。",
  },
  {
    title: "OpenAI新星 Sora2 徹底解説！",
    youtube_url: "https://www.youtube.com/watch?v=v3A31n-6L2k",
    level: "intermediate",
    sort_order: 7,
    description: "OpenAIの動画生成AI Sora2の徹底解説。",
  },
  {
    title: "AIを活用した超高速アプリ開発術",
    youtube_url: "https://www.youtube.com/watch?v=KF3v-hjIygc",
    level: "intermediate",
    sort_order: 8,
    description: "AIを活用した高速アプリ開発の手法を紹介。",
  },
  {
    title: "AIを入れても失敗する会社の共通点",
    youtube_url: "https://www.youtube.com/watch?v=jF8HKAZQn1U",
    level: "intermediate",
    sort_order: 9,
    description: "AI導入で失敗しがちなパターンとその対策。",
  },
  {
    title: "Notion AI実例 Slack・Gmail・会議全部つないだら",
    youtube_url: "https://www.youtube.com/watch?v=1MUyHjausQo",
    level: "intermediate",
    sort_order: 10,
    description: "Notion AIでSlack・Gmail・会議を統合する実例。",
  },

  // ── 上級（6本） ──
  {
    title: "400人イベントで満員になったAIセミナー",
    youtube_url: "https://www.youtube.com/watch?v=TWGYuL_SPT0",
    level: "advanced",
    sort_order: 1,
    description: "400人規模のAIセミナーの裏側を公開。",
  },
  {
    title: "万博 世界が見る映像を1年以上かけて作りました",
    youtube_url: "https://www.youtube.com/watch?v=s9aLlBl_bBQ",
    level: "advanced",
    sort_order: 2,
    description: "万博向け映像制作プロジェクトの舞台裏。",
  },
  {
    title: "ベンチャー経営者 初めての展示会出展",
    youtube_url: "https://www.youtube.com/watch?v=HBAK-ifdBY0",
    level: "advanced",
    sort_order: 3,
    description: "ベンチャー企業の展示会出展体験記。",
  },
  {
    title: "ベンチャー経営者1日ルーティン",
    youtube_url: "https://www.youtube.com/watch?v=nOFVnEpGKYg",
    level: "advanced",
    sort_order: 4,
    description: "ベンチャー経営者の1日のスケジュールを紹介。",
  },
  {
    title: "コワーキングスペースを卒業！新オフィス",
    youtube_url: "https://www.youtube.com/watch?v=HkgF2Hj_dsc",
    level: "advanced",
    sort_order: 5,
    description: "新オフィスへの移転ストーリー。",
  },
  {
    title: "事務所、もう出よう！社長が急かす",
    youtube_url: "https://www.youtube.com/watch?v=g1lStmwBkpc",
    level: "advanced",
    sort_order: 6,
    description: "オフィス移転の経緯とその裏側。",
  },
];

async function main() {
  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

  const databases = new Databases(client);

  // 既存動画の取得（重複チェック用）
  const existing = await databases.listDocuments(DATABASE_ID, VIDEOS_COLLECTION_ID, [
    Query.limit(500),
  ]);
  const existingTitles = new Set(existing.documents.map((d) => d.title));

  let created = 0;
  let skipped = 0;

  for (const video of videos) {
    if (existingTitles.has(video.title)) {
      console.log(`SKIP: ${video.title} (already exists)`);
      skipped++;
      continue;
    }

    await databases.createDocument(DATABASE_ID, VIDEOS_COLLECTION_ID, ID.unique(), {
      ...video,
      created_by: "seed-script",
    });
    console.log(`CREATED: [${video.level}] ${video.title}`);
    created++;
  }

  console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`);
}

main().catch(console.error);
