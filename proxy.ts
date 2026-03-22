// middleware.ts
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn  = !!req.auth
  const path        = req.nextUrl.pathname

  const isAuthPage  = path.startsWith("/login") || path.startsWith("/register")
  const isDashboard = path.startsWith("/my-tasks") || path.startsWith("/projects") || path.startsWith("/activity") || path.startsWith("/settings")

  // Protected routes — must be logged in
  if (!isLoggedIn && isDashboard) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Already logged in — skip auth pages
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Logged in users go to /dashboard not /
  if (isLoggedIn && path === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}