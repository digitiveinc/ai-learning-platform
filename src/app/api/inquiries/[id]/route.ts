import { NextResponse } from "next/server";
import { getUser, getUserRole, createAdminClient } from "@/lib/appwrite/server";
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
  if (role !== "admin") {
    return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  }

  const { id } = await params;
  const { status } = await request.json();

  const validStatuses = ["open", "in_progress", "resolved"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "無効なステータスです" }, { status: 400 });
  }

  try {
    const { databases } = createAdminClient();
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
      { error: "ステータスの更新に失敗しました" },
      { status: 500 }
    );
  }
}
