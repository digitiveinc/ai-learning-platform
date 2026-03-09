/**
 * 動画のタイトル・説明・サムネイルをCopilot寄りAI研修テーマに一括更新
 *
 * 使い方:
 *   npx tsx scripts/update-video-metadata.ts
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

type VideoUpdate = {
  title: string;
  description: string;
  thumbnail_url: string;
};

// sort_order をキーにした更新データ（level別）
const beginnerUpdates: Record<number, VideoUpdate> = {
  1: {
    title: "AI研修 基礎編①｜AIとは何か？ 仕組みと全体像を理解する",
    description: "AIの基本的な仕組み、機械学習・ディープラーニングの違い、ビジネスでのAI活用の全体像を初心者向けにわかりやすく解説します。",
    thumbnail_url: "/thumbnails/ai-basics.svg",
  },
  2: {
    title: "AI研修 基礎編②｜Copilotの基本操作と初めての対話",
    description: "Microsoft Copilotの画面構成、プロンプト入力の基本、初めてAIと対話する際のコツを実演しながら学びます。",
    thumbnail_url: "/thumbnails/chatgpt-usage.svg",
  },
  3: {
    title: "AI研修 基礎編③｜Copilotで文章を要約・翻訳してみよう",
    description: "Copilotを使ったビジネス文書の要約、英日翻訳、メール文面の作成など、すぐに使える実践テクニックを紹介します。",
    thumbnail_url: "/thumbnails/prompt-engineering.svg",
  },
  4: {
    title: "AI研修 基礎編④｜プロンプトの書き方 入門",
    description: "AIに的確な指示を出すためのプロンプトの基本構造、良いプロンプトと悪いプロンプトの違いを具体例で解説します。",
    thumbnail_url: "/thumbnails/prompt-engineering.svg",
  },
  5: {
    title: "AI研修 基礎編⑤｜Copilot × Word｜議事録・報告書を自動作成",
    description: "WordでのCopilot活用法。議事録の自動要約、報告書ドラフトの生成、文章のトーン調整など実務に直結するスキルを習得します。",
    thumbnail_url: "/thumbnails/ai-tools.svg",
  },
  6: {
    title: "AI研修 基礎編⑥｜Copilot × Excel 入門｜数式・関数をAIに任せる",
    description: "Excelの数式作成、VLOOKUP・IF関数の自動生成、データ整理をCopilotに任せる方法を実演します。",
    thumbnail_url: "/thumbnails/data-analysis.svg",
  },
  7: {
    title: "AI研修 基礎編⑦｜Copilot × PowerPoint｜スライド自動生成の基本",
    description: "PowerPointでCopilotを使い、テーマからスライドを自動生成する方法、デザイン調整のコツを学びます。",
    thumbnail_url: "/thumbnails/ai-tools.svg",
  },
  8: {
    title: "AI研修 基礎編⑧｜Copilot × Outlook｜メール作成・返信を効率化",
    description: "Outlookでの受信メール要約、返信文の自動生成、スケジュール調整メールの作成などCopilot活用術を紹介します。",
    thumbnail_url: "/thumbnails/ai-tools.svg",
  },
  9: {
    title: "AI研修 基礎編⑨｜Copilot × Teams｜会議の要約と議事録",
    description: "Teams会議でのCopilot活用法。リアルタイム要約、会議後の議事録自動生成、アクションアイテムの抽出を解説します。",
    thumbnail_url: "/thumbnails/ai-business.svg",
  },
  10: {
    title: "AI研修 基礎編⑩｜AIツールの選び方｜Copilot・ChatGPT・Gemini比較",
    description: "主要AIツールの特徴と得意分野を比較。業務内容に応じた最適なツール選びのポイントを解説します。",
    thumbnail_url: "/thumbnails/ai-basics.svg",
  },
  11: {
    title: "AI研修 基礎編⑪｜AI利用時のセキュリティと注意点",
    description: "業務でAIを使う際の情報漏洩リスク、機密データの扱い方、社内ガイドライン策定のポイントを学びます。",
    thumbnail_url: "/thumbnails/ai-ethics.svg",
  },
};

const intermediateUpdates: Record<number, VideoUpdate> = {
  1: {
    title: "AI研修 応用編①｜プロンプトエンジニアリング実践",
    description: "Few-shot、Chain of Thought、ロール指定など、高品質な出力を得るための上級プロンプト技法を実践的に学びます。",
    thumbnail_url: "/thumbnails/prompt-engineering.svg",
  },
  2: {
    title: "AI研修 応用編②｜Copilot × Excel 応用｜データ分析・グラフ作成",
    description: "ピボットテーブルの自動作成、売上データのトレンド分析、グラフ生成をCopilotで効率化する方法を解説します。",
    thumbnail_url: "/thumbnails/data-analysis.svg",
  },
  3: {
    title: "AI研修 応用編③｜Copilot × PowerPoint 応用｜提案書を仕上げる",
    description: "Wordの企画書からスライドを自動生成し、デザイン調整・アニメーション追加まで一気に仕上げるワークフローを紹介します。",
    thumbnail_url: "/thumbnails/ai-tools.svg",
  },
  4: {
    title: "AI研修 応用編④｜AIで業務フローを自動化する｜Power Automate連携",
    description: "Power AutomateとCopilotを組み合わせた業務自動化。承認フロー、データ入力の自動化、通知設定を実演します。",
    thumbnail_url: "/thumbnails/ai-dx.svg",
  },
  5: {
    title: "AI研修 応用編⑤｜AI × 会議改革｜生産性を2倍にする方法",
    description: "AI議事録ツール、Teamsの自動要約、アクションアイテム管理を組み合わせて会議の生産性を劇的に改善する手法を紹介します。",
    thumbnail_url: "/thumbnails/ai-business.svg",
  },
  6: {
    title: "AI研修 応用編⑥｜生成AIの最新動向｜GPT・Gemini・Claudeの進化",
    description: "主要な生成AIモデルの最新アップデート、マルチモーダル対応の現状、今後のトレンドを解説します。",
    thumbnail_url: "/thumbnails/generative-ai.svg",
  },
  7: {
    title: "AI研修 応用編⑦｜画像生成AI活用｜資料用ビジュアルを作る",
    description: "DALL-E、Copilot Image Creatorを使った資料用画像の生成、プロンプトによるスタイル調整のコツを解説します。",
    thumbnail_url: "/thumbnails/generative-ai.svg",
  },
  8: {
    title: "AI研修 応用編⑧｜ノーコード × AI｜業務アプリを素早く作る",
    description: "Power AppsやCopilot Studioを活用し、プログラミング不要で業務アプリを短期間で構築する方法を紹介します。",
    thumbnail_url: "/thumbnails/ai-dx.svg",
  },
  9: {
    title: "AI研修 応用編⑨｜AI導入の落とし穴｜失敗事例から学ぶ",
    description: "AI導入で陥りがちな失敗パターン、過度な期待への対処法、段階的な導入戦略のポイントを事例ベースで解説します。",
    thumbnail_url: "/thumbnails/ai-ethics.svg",
  },
  10: {
    title: "AI研修 応用編⑩｜部門横断AI活用｜営業・人事・経理での実践例",
    description: "営業資料の自動作成、人事面談の要約、経理データ分析など、各部門でのCopilot活用事例を具体的に紹介します。",
    thumbnail_url: "/thumbnails/ai-business.svg",
  },
};

const advancedUpdates: Record<number, VideoUpdate> = {
  1: {
    title: "AI研修 上級編①｜AI戦略の立て方｜全社導入ロードマップ",
    description: "経営層向けのAI導入戦略。ROI試算、段階的展開計画、組織体制の構築、KPI設計の考え方を解説します。",
    thumbnail_url: "/thumbnails/ai-business.svg",
  },
  2: {
    title: "AI研修 上級編②｜AIプロジェクトマネジメント実践",
    description: "AIプロジェクトの進め方、PoC設計、ベンダー選定、社内推進チームの組成など実務レベルのノウハウを共有します。",
    thumbnail_url: "/thumbnails/ai-business.svg",
  },
  3: {
    title: "AI研修 上級編③｜AI倫理とガバナンス｜企業が守るべきルール",
    description: "AI倫理ガイドライン、バイアス対策、著作権問題、個人情報保護法との関係など企業が押さえるべき法的・倫理的論点を整理します。",
    thumbnail_url: "/thumbnails/ai-ethics.svg",
  },
  4: {
    title: "AI研修 上級編④｜Copilot Studio｜社内専用AIボットを作る",
    description: "Copilot Studioを使って、社内FAQ対応やナレッジ検索ができる独自AIボットを構築する方法をステップバイステップで解説します。",
    thumbnail_url: "/thumbnails/ai-dx.svg",
  },
  5: {
    title: "AI研修 上級編⑤｜AI × DX推進｜デジタル変革の最前線",
    description: "AIを軸にしたDX戦略の最新事例、レガシーシステムからの移行、データ基盤構築のベストプラクティスを紹介します。",
    thumbnail_url: "/thumbnails/ai-dx.svg",
  },
  6: {
    title: "AI研修 上級編⑥｜AI時代のリーダーシップ｜組織を変革に導く",
    description: "AI時代に求められるリーダー像、チームのAIリテラシー向上施策、変革マネジメントの実践的アプローチを解説します。",
    thumbnail_url: "/thumbnails/machine-learning.svg",
  },
};

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

  for (const doc of response.documents) {
    const level = doc.level as string;
    const sortOrder = doc.sort_order as number;

    let updateData: VideoUpdate | undefined;
    if (level === "beginner") updateData = beginnerUpdates[sortOrder];
    else if (level === "intermediate") updateData = intermediateUpdates[sortOrder];
    else if (level === "advanced") updateData = advancedUpdates[sortOrder];

    if (!updateData) {
      console.log(`SKIP: [${level}/${sortOrder}] ${doc.title} (no mapping)`);
      continue;
    }

    await databases.updateDocument(DATABASE_ID, VIDEOS_COLLECTION_ID, doc.$id, {
      title: updateData.title,
      description: updateData.description,
      thumbnail_url: updateData.thumbnail_url,
    });
    console.log(`UPDATE: [${level}/${sortOrder}] ${doc.title} -> ${updateData.title}`);
    updated++;
  }

  console.log(`\nDone! Updated: ${updated}`);
}

main().catch(console.error);
