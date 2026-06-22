import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/** 라우트 미들웨어 — Supabase 세션 검증 + profiles.role 기반 /admin·/store 접근 제어 */
export const middleware = async (request: NextRequest) => {
  const { supabaseResponse, supabase, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isLogin = pathname === "/login";
  const isAdmin = pathname.startsWith("/admin");
  const isStore = pathname.startsWith("/store");

  if (!user && (isAdmin || isStore)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user) {
    /** Supabase: profiles.role·store_id 조회 */
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, store_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      if (!isLogin) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
      }
      return supabaseResponse;
    }

    const role = profile.role;
    const hasStore = !!profile.store_id;
    const home = role === "SUPER_ADMIN" ? "/admin" : hasStore ? "/store" : "/login";

    if (isLogin || pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = home;
      if (home === "/login") return supabaseResponse;
      return NextResponse.redirect(url);
    }

    if (isAdmin && role !== "SUPER_ADMIN") {
      const url = request.nextUrl.clone();
      url.pathname = hasStore ? "/store" : "/login";
      return NextResponse.redirect(url);
    }

    if (isStore && role === "SUPER_ADMIN") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }

    // 입점 승인 전 매장관리자 — /store 접근 차단
    if (isStore && role !== "SUPER_ADMIN" && !hasStore) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
};

export const config = {
  matcher: ["/", "/login", "/admin/:path*", "/store/:path*"],
};
