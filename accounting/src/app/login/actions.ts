"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { companyBlock, endSession, startUserSession } from "@/lib/auth";
import { fakeVerify, verifyPassword } from "@/lib/password";
import { isLocked, recordAttempt } from "@/lib/rate-limit";
import { normalizeCode } from "@/lib/codes";
import { str, type FormState } from "@/lib/form";

const GENERIC = "بيانات الدخول غير صحيحة. تأكد من رقم الاشتراك واسم المستخدم وكلمة السر.";

export async function loginAction(_: FormState, fd: FormData): Promise<FormState> {
  const code = normalizeCode(str(fd, "code"));
  const username = str(fd, "username").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const data = { code, username };

  if (!code || !username || !password) return { error: "عبّي كل الحقول", data };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const key = `user:${code}:${username}`;
  const ipKey = `ip:${ip}`;
  if ((await isLocked(key)) || (await isLocked(ipKey))) {
    return { error: "محاولات كتير غلط. استنى ربع ساعة وجرب مرة تانية.", data };
  }

  const company = await prisma.company.findUnique({ where: { subscriptionCode: code } });
  const user = company
    ? await prisma.user.findUnique({ where: { companyId_username: { companyId: company.id, username } } })
    : null;

  const valid = user ? await verifyPassword(password, user.passwordHash) : await fakeVerify(password);

  if (!company || !user || !valid || !user.active) {
    await Promise.all([recordAttempt(key, false), recordAttempt(ipKey, false)]);
    return { error: user && valid && !user.active ? "هاد الحساب موقوف. تواصل مع مدير الشركة." : GENERIC, data };
  }

  const block = companyBlock(company);
  if (block === "suspended") return { error: "اشتراك الشركة موقوف. تواصل مع الدعم.", data };
  if (block === "expired") return { error: "انتهى اشتراك الشركة. جدّد الاشتراك لتكمل.", data };

  await recordAttempt(key, true);
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }),
    prisma.auditLog.create({ data: { companyId: company.id, userId: user.id, action: "login" } }),
  ]);
  await startUserSession(user.id, company.id);
  redirect("/dashboard");
}

export async function logoutAction() {
  await endSession("user");
  redirect("/login");
}
