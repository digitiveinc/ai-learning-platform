/**
 * Appwrite コレクションに thumbnail_url 属性を追加するスクリプト
 *
 * 使い方:
 *   npx tsx scripts/add-thumbnail-attribute.ts
 *
 * 事前に .env.local の環境変数が設定されていること。
 */

import { Client, Databases } from "node-appwrite";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const API_KEY = process.env.APPWRITE_API_KEY!;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const VIDEOS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_VIDEOS_COLLECTION_ID!;
const ARCHIVES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ARCHIVES_COLLECTION_ID;

async function addAttribute(databases: Databases, collectionId: string, collectionName: string) {
  try {
    await databases.createStringAttribute(
      DATABASE_ID,
      collectionId,
      "thumbnail_url",
      2048,    // max length
      false,   // required = false
      "",      // default value
      false    // array = false
    );
    console.log(`OK: ${collectionName} に thumbnail_url 属性を追加しました`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("already exists") || message.includes("Attribute already exists")) {
      console.log(`SKIP: ${collectionName} の thumbnail_url は既に存在します`);
    } else {
      console.error(`ERROR: ${collectionName} - ${message}`);
    }
  }
}

async function main() {
  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

  const databases = new Databases(client);

  // Videos コレクション
  await addAttribute(databases, VIDEOS_COLLECTION_ID, "Videos");

  // Archives コレクション
  if (ARCHIVES_COLLECTION_ID) {
    await addAttribute(databases, ARCHIVES_COLLECTION_ID, "Archives");
  } else {
    console.log("SKIP: Archives コレクションIDが未設定です");
  }

  console.log("\n完了！属性がAvailableになるまで数秒かかる場合があります。");
}

main().catch(console.error);
