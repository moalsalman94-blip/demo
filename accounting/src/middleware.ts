import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, USER_COOKIE, verifyToken } from "@/lib/session";

// حماية أولية سريعة: بدون جلسة صالحة ما في دخول للوحات
// (التحقق الكامل من حالة الاشتراك بيصير بالسيرفر بكل صفحة)
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const ok = await verifyToken(req.cookies.get(ADMIN_COOKIE)?.value, "admin");
    if (!ok) return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  if (pathname.startsWith("/dashboard")) {
    const ok = await verifyToken(req.cookies.get(USER_COOKIE)?.value, "user");
    if (!ok) return NextResponse.redirect(new URL("/login", req.url));
  }

  const res = NextResponse.next();
  return res;
}

export const config = { matcher: ["/admin/:path*", "/dashboard/:path*"] };
