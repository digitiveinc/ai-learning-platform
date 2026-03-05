import Link from "next/link";
import { notFound } from "next/navigation";
import { Query } from "node-appwrite";
import { requireAdmin } from "@/lib/appwrite/auth-guard";
import { createAdminClient, getUserLevel, getUserEmployeeId } from "@/lib/appwrite/server";
import { Header } from "@/components/header";
import { UserForm } from "@/components/user-form";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_USER_SETTINGS_COLLECTION_ID,
} from "@/lib/appwrite/config";
import { emailToEmployeeId } from "@/lib/appwrite/employee-id";

export const dynamic = "force-dynamic";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user: currentUser, role } = await requireAdmin();
  const currentEmployeeId = await getUserEmployeeId(currentUser.$id);

  const { users, databases } = createAdminClient();

  let targetUser;
  try {
    targetUser = await users.get(id);
  } catch {
    notFound();
  }

  const settingsRes = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_USER_SETTINGS_COLLECTION_ID,
    [Query.equal("user_id", id), Query.limit(1)]
  );
  const settings = settingsRes.documents[0];

  const targetEmployeeId = settings?.employee_id || emailToEmployeeId(targetUser.email);
  const userLevel = getUserLevel(targetUser.labels || []);
  const userRole = targetUser.labels?.includes("admin") ? "admin" : "user";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header email={currentUser.email} role={role} employeeId={currentEmployeeId} />
      <main className="container mx-auto px-4 py-8">
        <Link href="/admin/users" className="text-sm text-blue-600 hover:underline">
          &larr; ユーザー管理に戻る
        </Link>
        <div className="mt-4">
          <UserForm
            mode="edit"
            initialData={{
              id,
              employeeId: targetEmployeeId,
              displayName: targetUser.name || "",
              level: userLevel || "beginner",
              accessMode: settings?.access_mode || "cumulative",
              role: userRole,
            }}
          />
        </div>
      </main>
    </div>
  );
}
