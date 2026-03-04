import { NextResponse } from "next/server";
import { getUser, getUserRole, createAdminClient } from "@/lib/appwrite/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const role = await getUserRole(user.$id);
  if (role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { id } = await params;
  const { role: newRole } = await request.json();

  if (newRole !== "admin" && newRole !== "user") {
    return NextResponse.json({ error: "無効なロールです" }, { status: 400 });
  }

  const { users } = createAdminClient();
  const targetUser = await users.get(id);
  const currentLabels = targetUser.labels || [];

  let updatedLabels: string[];
  if (newRole === "admin") {
    updatedLabels = [...new Set([...currentLabels, "admin"])];
  } else {
    updatedLabels = currentLabels.filter((l: string) => l !== "admin");
  }

  await users.updateLabels(id, updatedLabels);

  return NextResponse.json({ success: true });
}
