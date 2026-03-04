import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ID } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY } from "@/lib/appwrite/config";

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
    // users.create(userId, email, phone, password, name)
    await users.create(ID.unique(), email, undefined, password);

    // REST API でセッション作成（API キーでプラットフォーム制限バイパス）
    const res = await fetch(`${APPWRITE_ENDPOINT}/account/sessions/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-appwrite-project": APPWRITE_PROJECT_ID,
        "x-appwrite-key": APPWRITE_API_KEY,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Appwrite session error:", JSON.stringify(data));
      return NextResponse.json(
        { error: "ユーザーは作成されましたが、セッション作成に失敗しました。ログインページからログインしてください。" },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set("appwrite-session", data.secret, {
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
