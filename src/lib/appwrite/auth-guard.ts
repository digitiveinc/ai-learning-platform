import { redirect } from "next/navigation";
import { getUser, getUserRole } from "./server";

export async function requireAuth() {
  const user = await getUser();
  if (!user) redirect("/login");

  const role = await getUserRole(user.$id);
  return { user, role };
}

export async function requireAdmin() {
  const { user, role } = await requireAuth();
  if (role !== "admin") redirect("/");
  return { user, role };
}
