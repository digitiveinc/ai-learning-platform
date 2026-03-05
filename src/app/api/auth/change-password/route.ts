import { NextResponse } from "next/server";
import { createSessionClient } from "@/lib/appwrite/server";

export async function POST(request: Request) {
  const sessionClient = await createSessionClient();
  if (!sessionClient) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { currentPassword, newPassword } = await request.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "現在のパスワードと新しいパスワードは必須です" },
      { status: 400 }
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "新しいパスワードは8文字以上で入力してください" },
      { status: 400 }
    );
  }

  try {
    await sessionClient.account.updatePassword(newPassword, currentPassword);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Change password error:", err);
    return NextResponse.json(
      { error: "パスワードの変更に失敗しました。現在のパスワードが正しいか確認してください。" },
      { status: 400 }
    );
  }
}
