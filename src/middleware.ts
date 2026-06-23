import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/** 미들웨어 — 세션 갱신 + 로그인 여부만 (프로필 DB 조회 제거 → 페이지 전환 가속) */
export const middleware = async (request: NextRequest) => {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isLogin = pathname === "/login";
  const isProtected = pathname.startsWith("/admin") || pathname.startsWith("/store");

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && (isLogin || pathname === "/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/store";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
};

export const config = {
  matcher: ["/", "/login", "/admin/:path*", "/store/:path*"],
};
