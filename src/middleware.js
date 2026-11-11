import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

function officePath() {
  const value = (process.env.ADMIN_PATH || "stand-kassa").replace(/^\/+|\/+$/g, "");
  if (value === "ru" || value === "uz" || value === "api") return "stand-kassa";
  return value;
}

export default function middleware(request) {
  const secret = officePath();
  const { pathname } = request.nextUrl;
  if (pathname === "/stand-office" || pathname.startsWith("/stand-office/")) {
    return NextResponse.next();
  }
  const prefix = `/${secret}`;
  if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
    const url = request.nextUrl.clone();
    const tail = pathname.slice(prefix.length) || "/";
    url.pathname = `/stand-office${tail === "/" ? "" : tail}`;
    return NextResponse.rewrite(url);
  }
  return handleI18nRouting(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
