import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "./admin";
import type { Video } from "@/lib/types";

export type AuthUser = {
  uid: string;
  email: string;
  role: "superadmin" | "admin" | "user";
  level: Video["level"];
  accessMode: "exact" | "cumulative";
  displayName: string;
};

async function getDecodedClaims() {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;
  if (!session) return null;
  try {
    return await adminAuth().verifySessionCookie(session, true);
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const claims = await getDecodedClaims();
  if (!claims) redirect("/login");

  return {
    uid: claims.uid,
    email: claims.email ?? "",
    role: (claims.role as AuthUser["role"]) ?? "user",
    level: (claims.level as Video["level"]) ?? "beginner",
    accessMode: (claims.accessMode as "exact" | "cumulative") ?? "cumulative",
    displayName: claims.displayName ?? claims.email ?? "",
  };
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  if (user.role !== "admin" && user.role !== "superadmin") redirect("/");
  return user;
}

export async function requireSuperAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  if (user.role !== "superadmin") redirect("/");
  return user;
}

export async function requireLevelAccess(level: Video["level"]): Promise<AuthUser> {
  const user = await requireAuth();
  const LEVELS: Video["level"][] = ["beginner", "intermediate", "advanced"];
  const userIdx = LEVELS.indexOf(user.level);
  const reqIdx = LEVELS.indexOf(level);

  const accessible =
    user.accessMode === "cumulative" ? reqIdx <= userIdx : reqIdx === userIdx;

  if (!accessible) redirect("/");
  return user;
}

export async function getOptionalAuth(): Promise<AuthUser | null> {
  const claims = await getDecodedClaims();
  if (!claims) return null;
  return {
    uid: claims.uid,
    email: claims.email ?? "",
    role: (claims.role as AuthUser["role"]) ?? "user",
    level: (claims.level as Video["level"]) ?? "beginner",
    accessMode: (claims.accessMode as "exact" | "cumulative") ?? "cumulative",
    displayName: claims.displayName ?? claims.email ?? "",
  };
}
