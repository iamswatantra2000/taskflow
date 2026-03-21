// middleware.ts  ← root of project, NOT inside app/
import { auth } from "./lib/auth";
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith("/login") ||
                     req.nextUrl.pathname.startsWith("/register")
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard") ||
                      req.nextUrl.pathname === "/"

  // Not logged in + trying to access protected page → redirect to login
  if (!isLoggedIn && isDashboard) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Already logged in + visiting auth pages → redirect to dashboard
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return NextResponse.next()
})

// Tell Next.js which routes this middleware should run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}