import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicRoutes = ["/login", "/api/auth/login"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  const session = request.cookies.get("appwrite-session");

  // 未ログインで保護ルートへのアクセス → ログインへリダイレクト
  if (!session?.value && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ログイン済みでログインページへのアクセス → セッション検証
  if (session?.value && pathname === "/login") {
    // セッションが有効か確認
    try {
      const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
      const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
      const res = await fetch(`${endpoint}/account`, {
        headers: {
          "x-appwrite-project": projectId!,
          "x-appwrite-session": session.value,
        },
      });
      if (res.ok) {
        // 有効なセッション → ダッシュボードへ
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      // フェッチ失敗時はフォールスルー
    }
    // 無効なセッション → クッキー削除してログインページ表示
    const response = NextResponse.next();
    response.cookies.delete("appwrite-session");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
