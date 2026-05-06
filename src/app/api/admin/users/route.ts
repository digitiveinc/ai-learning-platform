import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { buildLoginEmail } from "@/lib/login-id";

async function getAuthUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;
  if (!session) return null;
  try {
    return await adminAuth().verifySessionCookie(session, true);
  } catch { return null; }
}

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const role = user.role as string | undefined;
  if (role !== "admin" && role !== "superadmin") {
    return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  }

  const db = adminDb();
  const snapshot = await db.collection("users").orderBy("createdAt", "desc").get();

  const users = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const role = user.role as string | undefined;
  if (role !== "admin" && role !== "superadmin") {
    return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  }

  const body = await request.json();
  const { email, displayName, role: userRole, level, accessMode, companyId, employeeId, password } = body;

  const db = adminDb();

  // 企業ID + ユーザーID + パスワード方式
  if (companyId && employeeId && password) {
    const loginEmail = buildLoginEmail(companyId, employeeId);

    // 重複チェック
    const existing = await db.collection("users")
      .where("companyId", "==", companyId)
      .where("employeeId", "==", employeeId)
      .limit(1)
      .get();
    if (!existing.empty) {
      return NextResponse.json({ error: "この企業ID・ユーザーIDはすでに登録されています" }, { status: 400 });
    }

    const authUser = await adminAuth().createUser({
      email: loginEmail,
      password,
      displayName: displayName || "",
    });

    const claims = {
      role: userRole || "user",
      level: level || "beginner",
      accessMode: accessMode || "cumulative",
      displayName: displayName || "",
    };
    await adminAuth().setCustomUserClaims(authUser.uid, claims);

    await db.collection("users").doc(authUser.uid).set({
      uid: authUser.uid,
      email: loginEmail,
      companyId,
      employeeId,
      ...claims,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id: authUser.uid });
  }

  // Googleアカウント方式（メールアドレスで事前登録）
  if (!email) {
    return NextResponse.json({ error: "メールアドレスまたは企業ID・ユーザーID・パスワードが必要です" }, { status: 400 });
  }

  const ref = db.collection("users").doc();
  await ref.set({
    email,
    displayName: displayName || "",
    role: userRole || "user",
    level: level || "beginner",
    accessMode: accessMode || "cumulative",
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, id: ref.id });
}
