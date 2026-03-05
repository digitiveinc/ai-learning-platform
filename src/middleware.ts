import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicRoutes = ["/login", "/api/auth/login"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  const session = request.cookies.get("appwrite-session");

  // 未ログインで保護ルートへのアクセス → ログインへリダイレクト
  if (!session?.value && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ログイン済みでログインページへのアクセス → ダッシュボードへ
  if (session?.value && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
