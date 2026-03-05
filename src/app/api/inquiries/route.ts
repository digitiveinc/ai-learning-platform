import { NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";
import { getUser, getUserRole, createAdminClient, getUserEmployeeId } from "@/lib/appwrite/server";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_INQUIRIES_COLLECTION_ID,
} from "@/lib/appwrite/config";
import { sendInquiryNotification } from "@/lib/email";

export async function POST(request: Request) {
  const currentUser = await getUser();
  if (!currentUser) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { subject, message } = await request.json();

  if (!subject || !message) {
    return NextResponse.json(
      { error: "件名とメッセージは必須です" },
      { status: 400 }
    );
  }

  try {
    const { databases } = createAdminClient();
    const userName = await getUserEmployeeId(currentUser.$id);

    await databases.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_INQUIRIES_COLLECTION_ID,
      ID.unique(),
      {
        user_id: currentUser.$id,
        user_name: userName,
        subject,
        message,
        status: "open",
        created_at: new Date().toISOString(),
      }
    );

    // メール通知（失敗してもエラーにしない）
    try {
      await sendInquiryNotification({ userName, subject, message });
    } catch (emailErr) {
      console.error("Email notification failed:", emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Create inquiry error:", err);
    return NextResponse.json(
      { error: "問い合わせの送信に失敗しました" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const currentUser = await getUser();
  if (!currentUser) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");

  try {
    const { databases } = createAdminClient();

    // mode=mine: ユーザー自身の問い合わせ履歴
    if (mode === "mine") {
      const res = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_INQUIRIES_COLLECTION_ID,
        [
          Query.equal("user_id", currentUser.$id),
          Query.orderDesc("created_at"),
          Query.limit(50),
        ]
      );

      const inquiries = res.documents.map((d) => ({
        id: d.$id,
        user_id: d.user_id,
        user_name: d.user_name,
        subject: d.subject,
        message: d.message,
        status: d.status || "open",
        created_at: d.created_at,
        reply_message: d.reply_message || undefined,
        reply_phone: d.reply_phone || undefined,
        replied_at: d.replied_at || undefined,
        replied_by: d.replied_by || undefined,
      }));

      return NextResponse.json({ inquiries });
    }

    // 管理者: 全問い合わせ一覧
    const role = await getUserRole(currentUser.$id);
    if (role !== "admin" && role !== "superadmin") {
      return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
    }

    const res = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_INQUIRIES_COLLECTION_ID,
      [Query.orderDesc("created_at"), Query.limit(100)]
    );

    const inquiries = res.documents.map((d) => ({
      id: d.$id,
      user_id: d.user_id,
      user_name: d.user_name,
      subject: d.subject,
      message: d.message,
      status: d.status || "open",
      created_at: d.created_at,
      reply_message: d.reply_message || undefined,
      reply_phone: d.reply_phone || undefined,
      replied_at: d.replied_at || undefined,
      replied_by: d.replied_by || undefined,
    }));

    return NextResponse.json({ inquiries });
  } catch (err) {
    console.error("List inquiries error:", err);
    return NextResponse.json(
      { error: "問い合わせ一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}
