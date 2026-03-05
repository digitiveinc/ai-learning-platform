import { redirect } from "next/navigation";
import { getUser, getUserRole, getUserAccessibleLevels } from "./server";
import type { Video } from "../types";

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

export async function requireLevelAccess(level: Video["level"]) {
  const { user, role } = await requireAuth();
  if (role !== "admin") {
    const accessible = await getUserAccessibleLevels(user.$id);
    if (!accessible.includes(level)) redirect("/");
  }
  return { user, role };
}
