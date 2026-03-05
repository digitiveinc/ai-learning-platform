import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY } from "@/lib/appwrite/config";
import { employeeIdToEmail } from "@/lib/appwrite/employee-id";

export async function POST(request: Request) {
  const { employeeId, password } = await request.json();

  if (!employeeId || !password) {
    return NextResponse.json(
      { error: "社員IDとパスワードは必須です" },
      { status: 400 }
    );
  }

  const email = employeeIdToEmail(employeeId);

  try {
    const res = await fetch(`${APPWRITE_ENDPOINT}/account/sessions/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-appwrite-project": APPWRITE_PROJECT_ID,
        "x-appwrite-key": APPWRITE_API_KEY,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Appwrite login error:", JSON.stringify(data));
      return NextResponse.json(
        { error: "社員IDまたはパスワードが正しくありません" },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set("appwrite-session", data.secret, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "ログインに失敗しました" },
      { status: 500 }
    );
  }
}
