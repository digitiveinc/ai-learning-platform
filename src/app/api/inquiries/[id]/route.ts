import { NextResponse } from "next/server";
import { getUser, getUserRole, createAdminClient, getUserEmployeeId } from "@/lib/appwrite/server";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_INQUIRIES_COLLECTION_ID,
} from "@/lib/appwrite/config";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getUser();
  if (!currentUser) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const role = await getUserRole(currentUser.$id);
  if (role !== "admin" && role !== "superadmin") {
    return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  try {
    const { databases } = createAdminClient();

    // 回答の場合
    if (body.reply_message !== undefined) {
      const adminName = await getUserEmployeeId(currentUser.$id);
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_INQUIRIES_COLLECTION_ID,
        id,
        {
          reply_message: body.reply_message,
          reply_phone: body.reply_phone || "",
          replied_at: new Date().toISOString(),
          replied_by: adminName,
          status: "resolved",
        }
      );
      return NextResponse.json({ success: true });
    }

    // ステータス更新の場合
    const { status } = body;
    const validStatuses = ["open", "in_progress", "resolved"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "無効なステータスです" }, { status: 400 });
    }

    await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_INQUIRIES_COLLECTION_ID,
      id,
      { status }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update inquiry error:", err);
    return NextResponse.json(
      { error: "更新に失敗しました" },
      { status: 500 }
    );
  }
}
