/**
 * 既存動画にデフォルトのサムネイルを一括設定するスクリプト
 *
 * 使い方:
 *   npx tsx scripts/set-default-thumbnails.ts
 */

import { Client, Databases, Query } from "node-appwrite";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const API_KEY = process.env.APPWRITE_API_KEY!;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const VIDEOS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_VIDEOS_COLLECTION_ID!;

// タイトルのキーワードでサムネイルを割り当て
function getThumbnailForTitle(title: string, level: string): string {
  const t = title.toLowerCase();

  // ChatGPT関連
  if (t.includes("chatgpt") || t.includes("議論") || t.includes("相談")) {
    return "/thumbnails/chatgpt-usage.svg";
  }
  // Canva / デザイン関連
  if (t.includes("canva") || t.includes("デザイン") || t.includes("チラシ") || t.includes("ポスター") || t.includes("pop")) {
    return "/thumbnails/ai-tools.svg";
  }
  // Notion関連
  if (t.includes("notion")) {
    return "/thumbnails/ai-tools.svg";
  }
  // 動画編集 / CapCut
  if (t.includes("capcap") || t.includes("字幕") || t.includes("capcut")) {
    return "/thumbnails/ai-tools.svg";
  }
  // AI選び方 / AI比較
  if (t.includes("どのai") || t.includes("chatgptしか") || t.includes("gemini") || t.includes("最強")) {
    return "/thumbnails/ai-basics.svg";
  }
  // Apple / iPhone / LINE
  if (t.includes("iphone") || t.includes("apple") || t.includes("line")) {
    return "/thumbnails/ai-basics.svg";
  }
  // プロジェクト管理 / タスク管理
  if (t.includes("プロジェクト") || t.includes("タスク")) {
    return "/thumbnails/ai-business.svg";
  }
  // 議事録 / 会議
  if (t.includes("議事録") || t.includes("会議") || t.includes("tl;dv")) {
    return "/thumbnails/ai-business.svg";
  }
  // Sora / 動画生成
  if (t.includes("sora")) {
    return "/thumbnails/generative-ai.svg";
  }
  // アプリ開発
  if (t.includes("アプリ開発")) {
    return "/thumbnails/ai-dx.svg";
  }
  // AI導入失敗
  if (t.includes("失敗")) {
    return "/thumbnails/ai-ethics.svg";
  }
  // セミナー / イベント
  if (t.includes("セミナー") || t.includes("イベント") || t.includes("万博")) {
    return "/thumbnails/ai-business.svg";
  }
  // 経営 / ビジネス
  if (t.includes("経営") || t.includes("ルーティン") || t.includes("オフィス") || t.includes("事務所") || t.includes("展示会")) {
    return "/thumbnails/ai-business.svg";
  }
  // 自己紹介
  if (t.includes("自己紹介") || t.includes("チャンネル")) {
    return "/thumbnails/ai-basics.svg";
  }

  // レベル別デフォルト
  switch (level) {
    case "beginner": return "/thumbnails/ai-basics.svg";
    case "intermediate": return "/thumbnails/prompt-engineering.svg";
    case "advanced": return "/thumbnails/ai-business.svg";
    default: return "/thumbnails/ai-basics.svg";
  }
}

async function main() {
  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

  const databases = new Databases(client);

  const response = await databases.listDocuments(DATABASE_ID, VIDEOS_COLLECTION_ID, [
    Query.limit(500),
  ]);

  let updated = 0;
  let skipped = 0;

  for (const doc of response.documents) {
    // 既にサムネが設定済みならスキップ
    if (doc.thumbnail_url) {
      console.log(`SKIP: ${doc.title} (already has thumbnail)`);
      skipped++;
      continue;
    }

    const thumbnail = getThumbnailForTitle(doc.title, doc.level);

    await databases.updateDocument(DATABASE_ID, VIDEOS_COLLECTION_ID, doc.$id, {
      thumbnail_url: thumbnail,
    });
    console.log(`SET: ${doc.title} -> ${thumbnail}`);
    updated++;
  }

  console.log(`\nDone! Updated: ${updated}, Skipped: ${skipped}`);
}

main().catch(console.error);
