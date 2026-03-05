import { redirect } from "next/navigation";
import { getUser, getUserRole, getUserAccessibleLevels, getUserCompanyId } from "./server";
import type { Video } from "../types";

export async function requireAuth() {
  const user = await getUser();
  if (!user) redirect("/login");

  const role = await getUserRole(user.$id);
  const companyId = await getUserCompanyId(user.$id);
  return { user, role, companyId };
}

export async function requireAdmin() {
  const { user, role, companyId } = await requireAuth();
  if (role !== "admin" && role !== "superadmin") redirect("/");
  return { user, role, companyId };
}

export async function requireSuperAdmin() {
  const { user, role, companyId } = await requireAuth();
  if (role !== "superadmin") redirect("/");
  return { user, role, companyId };
}

export async function requireLevelAccess(level: Video["level"]) {
  const { user, role, companyId } = await requireAuth();
  if (role !== "admin" && role !== "superadmin") {
    const accessible = await getUserAccessibleLevels(user.$id);
    if (!accessible.includes(level)) redirect("/");
  }
  return { user, role, companyId };
}
