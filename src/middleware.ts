import { NextResponse, type NextRequest } from "next/server";
import { Client, Account, Users } from "node-appwrite";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicRoutes = ["/login", "/register", "/api/auth/login", "/api/auth/register"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  const session = request.cookies.get("appwrite-session");

  if (!session?.value && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session?.value && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Admin route protection
  if (session?.value && pathname.startsWith("/admin")) {
    try {
      const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
        .setSession(session.value);

      const account = new Account(client);
      const user = await account.get();

      const adminClient = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
        .setKey(process.env.APPWRITE_API_KEY!);

      const users = new Users(adminClient);
      const fullUser = await users.get(user.$id);

      if (!fullUser.labels?.includes("admin")) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
