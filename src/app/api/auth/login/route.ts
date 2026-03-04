import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Query } from "node-appwrite";
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

  try {
    // まず REST API でセッション作成を試みる（パスワード検証付き）
    const sessionRes = await fetch(`${APPWRITE_ENDPOINT}/account/sessions/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-appwrite-project": APPWRITE_PROJECT_ID,
      },
      body: JSON.stringify({ email, password }),
    });

    if (!sessionRes.ok) {
      const errorData = await sessionRes.json();
      console.error("Appwrite session error:", errorData);
      return NextResponse.json(
        { error: "メールアドレスまたはパスワードが正しくありません" },
        { status: 401 }
      );
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
    console.error("Login error:", err);

    // REST API 失敗の場合、admin SDK 経由でフォールバック
    try {
      const { users } = createAdminClient();
      const userList = await users.list([Query.equal("email", [email])]);

      if (userList.total === 0) {
        return NextResponse.json(
          { error: "メールアドレスまたはパスワードが正しくありません" },
          { status: 401 }
        );
      }

      // Admin SDK でセッション作成（パスワード検証はREST APIで失敗済み）
      return NextResponse.json(
        { error: "ログインに失敗しました。しばらくしてからお試しください。" },
        { status: 500 }
      );
    } catch {
      return NextResponse.json(
        { error: "ログインに失敗しました" },
        { status: 500 }
      );
    }
  }
}
