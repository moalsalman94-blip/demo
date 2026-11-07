import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { prisma } from "./db";
import { forCompany } from "./tenant";
import {
  ADMIN_COOKIE,
  USER_COOKIE,
  cookieOptions,
  signToken,
  verifyToken,
  type AdminToken,
  type UserToken,
} from "./session";

export type CompanyBlock = "expired" | "suspended" | null;

export function companyBlock(c: { status: string; expiresAt: Date }): CompanyBlock {
  if (c.status !== "ACTIVE") return "suspended";
  if (c.expiresAt.getTime() < Date.now()) return "expired";
  return null;
}

/**
 * جلسة مستخدم الشركة. بنرجع نتحقق من قاعدة البيانات بكل طلب،
 * فلو أوقفت اشتراك شركة أو عطّلت مستخدم بينطرد فوراً.
 */
export const getCompanySession = cache(async () => {
  const jar = await cookies();
  const token = await verifyToken<UserToken>(jar.get(USER_COOKIE)?.value, "user");
  if (!token) return null;

  const user = await prisma.user.findFirst({
    where: { id: token.uid, companyId: token.cid, active: true },
    include: { company: true },
  });
  if (!user) return null;

  const { company, passwordHash: _ph, ...safeUser } = user;
  void _ph;
  return {
    user: safeUser,
    company,
    block: companyBlock(company),
    db: forCompany(company.id),
  };
});

/** للصفحات: بيرجع الجلسة أو بيحوّل لصفحة الدخول */
export async function requireCompanyUser(roles?: UserRole[]) {
  const s = await getCompanySession();
  if (!s) redirect("/login");
  if (s.block) redirect(`/login?blocked=${s.block}`);
  if (roles && !roles.includes(s.user.role)) redirect("/dashboard?denied=1");
  return s;
}

export const getAdminSession = cache(async () => {
  const jar = await cookies();
  const token = await verifyToken<AdminToken>(jar.get(ADMIN_COOKIE)?.value, "admin");
  if (!token) return null;
  return prisma.superAdmin.findUnique({
    where: { id: token.aid },
    select: { id: true, username: true },
  });
});

export async function requireAdmin() {
  const a = await getAdminSession();
  if (!a) redirect("/admin/login");
  return a;
}

export async function startUserSession(uid: string, cid: string) {
  (await cookies()).set(USER_COOKIE, await signToken({ kind: "user", uid, cid }), cookieOptions);
}

export async function startAdminSession(aid: string) {
  (await cookies()).set(ADMIN_COOKIE, await signToken({ kind: "admin", aid }), cookieOptions);
}

export async function endSession(which: "user" | "admin") {
  (await cookies()).delete(which === "user" ? USER_COOKIE : ADMIN_COOKIE);
}
