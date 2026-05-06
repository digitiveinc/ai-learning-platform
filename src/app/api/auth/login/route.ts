import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

const SESSION_EXPIRES_MS = 14 * 24 * 60 * 60 * 1000; // 14日

export async function POST(request: Request) {
  const { idToken } = await request.json();
  if (!idToken) {
    return NextResponse.json({ error: "idToken が必要です" }, { status: 400 });
  }

  try {
    const decoded = await adminAuth().verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = decoded.email ?? "";

    const db = adminDb();
    const userDoc = await db.collection("users").doc(uid).get();

    let role = "user";
    let level = "beginner";
    let accessMode = "cumulative";
    let displayName = decoded.name ?? email;

    if (userDoc.exists) {
      const data = userDoc.data()!;
      role = data.role ?? "user";
      level = data.level ?? "beginner";
      accessMode = data.accessMode ?? "cumulative";
      displayName = data.displayName ?? displayName;
    } else {
      // 初回ログイン：メールアドレスで事前登録済みレコードを検索
      const emailQuery = await db
        .collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();

      if (!emailQuery.empty) {
        const existing = emailQuery.docs[0];
        const data = existing.data();
        role = data.role ?? "user";
        level = data.level ?? "beginner";
        accessMode = data.accessMode ?? "cumulative";
        displayName = data.displayName ?? displayName;

        await db.collection("users").doc(uid).set({ ...data, uid, email });
      } else {
        return NextResponse.json(
          { error: "このアカウントはまだ登録されていません。管理者にお問い合わせください。" },
          { status: 403 }
        );
      }
    }

    await adminAuth().setCustomUserClaims(uid, { role, level, accessMode, displayName });

    const sessionCookie = await adminAuth().createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_MS,
    });

    const cookieStore = await cookies();
    cookieStore.set("__session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_EXPIRES_MS / 1000,
    });

    return NextResponse.json({ success: true, role });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "ログインに失敗しました" }, { status: 500 });
  }
}
