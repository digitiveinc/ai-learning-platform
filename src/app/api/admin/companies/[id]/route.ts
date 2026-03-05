import { NextResponse } from "next/server";
import { getUser, getUserRole, createAdminClient } from "@/lib/appwrite/server";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_COMPANIES_COLLECTION_ID,
} from "@/lib/appwrite/config";

async function requireSuperAdminApi() {
  const currentUser = await getUser();
  if (!currentUser) {
    return { error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }) };
  }
  const role = await getUserRole(currentUser.$id);
  if (role !== "superadmin") {
    return { error: NextResponse.json({ error: "スーパー管理者権限が必要です" }, { status: 403 }) };
  }
  return { currentUser };
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSuperAdminApi();
  if ("error" in auth && auth.error) return auth.error;

  const { id } = await params;
  const { companyName, isActive } = await request.json();

  try {
    const { databases } = createAdminClient();
    const updateData: Record<string, unknown> = {};
    if (companyName !== undefined) updateData.company_name = companyName;
    if (isActive !== undefined) updateData.is_active = isActive;

    await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_COMPANIES_COLLECTION_ID,
      id,
      updateData
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update company error:", err);
    return NextResponse.json({ error: "企業の更新に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSuperAdminApi();
  if ("error" in auth && auth.error) return auth.error;

  const { id } = await params;

  try {
    const { databases } = createAdminClient();
    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_COMPANIES_COLLECTION_ID,
      id
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete company error:", err);
    return NextResponse.json({ error: "企業の削除に失敗しました" }, { status: 500 });
  }
}
