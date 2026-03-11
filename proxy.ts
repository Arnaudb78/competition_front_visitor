import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const token = req.cookies.get("account_token")?.value;
  const { pathname } = req.nextUrl;

  const isPublic = pathname === "/" || pathname.startsWith("/auth");
  const isVisitor = pathname.startsWith("/visit");

  if (isVisitor && pathname !== "/visit/desktop") {
    const ua = req.headers.get("user-agent") ?? "";
    const isMobile =
      /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(ua);
    if (!isMobile) {
      return NextResponse.redirect(new URL("/visit/desktop", req.url));
    }
  }

  if (!token && !isPublic && !isVisitor) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (token && isPublic) {
    return NextResponse.redirect(new URL("/home", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|manifest.json|icons|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.webp|.*\\.gif|.*\\.mp4|.*\\.mp3|.*\\.webm).*)"],
};
