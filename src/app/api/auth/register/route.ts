import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ID } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from "@/lib/appwrite/config";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "メールアドレスとパスワードは必須です" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "パスワードは8文字以上で入力してください" },
      { status: 400 }
    );
  }

  try {
    // Admin SDK でユーザー作成
    const { users } = createAdminClient();
    const user = await users.create(ID.unique(), email, password);

    // REST API で直接セッション作成（パスワード検証付き）
    const sessionRes = await fetch(`${APPWRITE_ENDPOINT}/account/sessions/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-appwrite-project": APPWRITE_PROJECT_ID,
      },
      body: JSON.stringify({ email, password }),
    });

    if (!sessionRes.ok) {
      // ユーザーは作成済みだがセッション作成失敗 → admin APIでセッション作成
      const session = await users.createSession(user.$id);
      const cookieStore = await cookies();
      cookieStore.set("appwrite-session", session.secret, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
      return NextResponse.json({ success: true });
    }

    const session = await sessionRes.json();

    const cookieStore = await cookies();
    cookieStore.set("appwrite-session", session.secret, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "登録に失敗しました";
    console.error("Register error:", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
