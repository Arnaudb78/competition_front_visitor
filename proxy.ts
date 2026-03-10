import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const token = req.cookies.get("account_token")?.value;
  const { pathname } = req.nextUrl;

  const isPublic = pathname === "/" || pathname.startsWith("/auth");
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (token && isPublic) {
    return NextResponse.redirect(new URL("/home", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|manifest.json|icons).*)"],
};
