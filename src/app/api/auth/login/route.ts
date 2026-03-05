import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY } from "@/lib/appwrite/config";
import { employeeIdToEmail } from "@/lib/appwrite/employee-id";
import { getCompanyByCode } from "@/lib/appwrite/server";

export async function POST(request: Request) {
  const { companyCode, employeeId, password } = await request.json();

  if (!companyCode || !employeeId || !password) {
    return NextResponse.json(
      { error: "企業コード、社員ID、パスワードは必須です" },
      { status: 400 }
    );
  }

  // 企業コード検証
  const company = await getCompanyByCode(companyCode);
  if (!company) {
    return NextResponse.json(
      { error: "企業コードが正しくありません" },
      { status: 401 }
    );
  }
  if (!company.is_active) {
    return NextResponse.json(
      { error: "この企業アカウントは無効です" },
      { status: 403 }
    );
  }

  const email = employeeIdToEmail(employeeId, companyCode);

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
