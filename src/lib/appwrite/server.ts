import { Client, Account, Databases, Users, Query } from "node-appwrite";
import { cookies } from "next/headers";
import {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_API_KEY,
  APPWRITE_DATABASE_ID,
  APPWRITE_USER_SETTINGS_COLLECTION_ID,
} from "./config";
import type { UserSettings, Video } from "../types";
import { getAccessibleLevels } from "../types";
import { emailToEmployeeId } from "./employee-id";

// Admin client (API Key 認証)
export function createAdminClient() {
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  return {
    account: new Account(client),
    databases: new Databases(client),
    users: new Users(client),
  };
}

// Session client (ユーザーセッション認証)
export async function createSessionClient() {
  const cookieStore = await cookies();
  const session = cookieStore.get("appwrite-session");

  if (!session?.value) return null;

  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setSession(session.value);

  return {
    account: new Account(client),
    databases: new Databases(client),
  };
}

// 現在のユーザーを取得
export async function getUser() {
  try {
    const sessionClient = await createSessionClient();
    if (!sessionClient) return null;
    const user = await sessionClient.account.get();
    return user;
  } catch {
    return null;
  }
}

// ユーザーのロールを取得
export async function getUserRole(userId: string): Promise<string> {
  try {
    const { users } = createAdminClient();
    const user = await users.get(userId);
    return user.labels?.includes("admin") ? "admin" : "user";
  } catch {
    return "user";
  }
}

// ユーザーのレベルを取得（labelsから）
export function getUserLevel(labels: string[]): Video["level"] | null {
  const levelLabels: Video["level"][] = ["beginner", "intermediate", "advanced"];
  for (const l of levelLabels) {
    if (labels.includes(l)) return l;
  }
  return null;
}

// ユーザー設定を取得
export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  try {
    const { databases } = createAdminClient();
    const res = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_USER_SETTINGS_COLLECTION_ID,
      [Query.equal("user_id", userId), Query.limit(1)]
    );
    if (res.documents.length === 0) return null;
    const doc = res.documents[0];
    return {
      user_id: doc.user_id,
      employee_id: doc.employee_id,
      access_mode: doc.access_mode,
      display_name: doc.display_name || undefined,
    };
  } catch {
    return null;
  }
}

// ユーザーのアクセス可能レベルを取得
export async function getUserAccessibleLevels(userId: string): Promise<Video["level"][]> {
  const { users } = createAdminClient();
  const user = await users.get(userId);
  const isAdmin = user.labels?.includes("admin");
  if (isAdmin) return ["beginner", "intermediate", "advanced"];

  const level = getUserLevel(user.labels || []);
  if (!level) return [];

  const settings = await getUserSettings(userId);
  const accessMode = settings?.access_mode || "cumulative";
  return getAccessibleLevels(level, accessMode);
}

// ユーザーの社員IDを取得
export async function getUserEmployeeId(userId: string): Promise<string> {
  const settings = await getUserSettings(userId);
  if (settings?.employee_id) return settings.employee_id;
  // fallback: emailから推定
  const { users } = createAdminClient();
  const user = await users.get(userId);
  return emailToEmployeeId(user.email);
}
