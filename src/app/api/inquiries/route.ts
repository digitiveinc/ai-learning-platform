import { NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";
import { getUser, getUserRole, createAdminClient, getUserEmployeeId } from "@/lib/appwrite/server";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_INQUIRIES_COLLECTION_ID,
} from "@/lib/appwrite/config";

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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Create inquiry error:", err);
    return NextResponse.json(
      { error: "問い合わせの送信に失敗しました" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const currentUser = await getUser();
  if (!currentUser) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const role = await getUserRole(currentUser.$id);
  if (role !== "admin") {
    return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  }

  try {
    const { databases } = createAdminClient();
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
