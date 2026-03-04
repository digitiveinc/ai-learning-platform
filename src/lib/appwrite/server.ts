import { Client, Account, Databases, Users } from "node-appwrite";
import { cookies } from "next/headers";
import {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_API_KEY,
} from "./config";

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
