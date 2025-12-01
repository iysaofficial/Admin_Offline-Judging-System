import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isLoginPage = pathname === "/login";
  const adminSession = req.cookies.get("adminUser");

  // Jika belum login → redirect ke halaman login
  if (!adminSession && !isLoginPage) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Jika sudah login & mencoba akses /login → redirect ke dashboard
  if (adminSession && isLoginPage) {
    const dashboardUrl = req.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/addassessment/:path*",
    "/addparticipants/:path*",
    "/adduser/:path*",
    "/editassessment/:path*",
    "/editparticipants/:path*",
    "/editusers/:path*",
    "/listassessment/:path*",
    "/listparticipants/:path*",
    "/listuser/:path*",
    "/assignjudges/:path*",
    "/usersdetail/:path*",
    "/result/:path*",
    "/api/:path*", // optional kalau API juga perlu proteksi
  ],
};
