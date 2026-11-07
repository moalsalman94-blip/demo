"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { endSession, startAdminSession } from "@/lib/auth";
import { fakeVerify, verifyPassword } from "@/lib/password";
import { LIMITS, isLocked, recordAttempt } from "@/lib/rate-limit";
import { str, type FormState } from "@/lib/form";

export async function adminLoginAction(_: FormState, fd: FormData): Promise<FormState> {
  const username = str(fd, "username");
  const password = String(fd.get("password") ?? "");
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const key = `admin:${username}`;
  const ipKey = `admin-ip:${ip}`;

  if ((await isLocked(key)) || (await isLocked(ipKey, LIMITS.ip))) return { error: "محاولات كتير غلط. استنى ربع ساعة." };

  const admin = await prisma.superAdmin.findUnique({ where: { username } });
  const ok = admin ? await verifyPassword(password, admin.passwordHash) : await fakeVerify(password);
  if (!admin || !ok) {
    await Promise.all([recordAttempt(key, false), recordAttempt(ipKey, false)]);
    return { error: "بيانات الدخول غير صحيحة", data: { username } };
  }
  await recordAttempt(key, true);
  await startAdminSession(admin.id);
  redirect("/admin");
}

export async function adminLogoutAction() {
  await endSession("admin");
  redirect("/admin/login");
}
