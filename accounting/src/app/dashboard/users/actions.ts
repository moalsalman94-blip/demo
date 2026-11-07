"use server";
import { revalidatePath } from "next/cache";
import type { UserRole } from "@prisma/client";
import { requireCompanyUser } from "@/lib/auth";
import { hashPassword, passwordProblem } from "@/lib/password";
import { str, type FormState } from "@/lib/form";

const ROLES: UserRole[] = ["OWNER", "ACCOUNTANT", "VIEWER"];
const USERNAME_RE = /^[a-z0-9._-]{3,32}$/;

export async function createUserAction(_: FormState, fd: FormData): Promise<FormState> {
  const { db, company, user: me } = await requireCompanyUser(["OWNER"]);
  const fullName = str(fd, "fullName");
  const username = str(fd, "username").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const role = str(fd, "role") as UserRole;
  const data = { fullName, username, role };

  if (!fullName || !username) return { error: "عبّي كل الحقول", data };
  if (!USERNAME_RE.test(username)) return { error: "اسم المستخدم: أحرف إنجليزية صغيرة وأرقام فقط (3-32)", data };
  if (!ROLES.includes(role)) return { error: "الدور غير صحيح", data };
  const pp = passwordProblem(password);
  if (pp) return { error: pp, data };

  if ((await db.user.count()) >= company.maxUsers) {
    return { error: `وصلت للحد الأقصى (${company.maxUsers} مستخدمين). تواصل معنا لترقية الاشتراك.`, data };
  }
  if (await db.user.findFirst({ where: { username } })) return { error: "اسم المستخدم مستخدم من قبل", data };

  // طبقة العزل بتفرض companyId تبع الجلسة دائماً، حتى لو انبعت غيره
  await db.user.create({
    data: { companyId: company.id, fullName, username, role, passwordHash: await hashPassword(password) },
  });
  await db.auditLog.create({ data: { companyId: company.id, userId: me.id, action: "user.create", details: username } });
  revalidatePath("/dashboard/users");
  return { ok: `تمت إضافة ${fullName}` };
}

export async function toggleUserAction(fd: FormData) {
  const { db, company, user: me } = await requireCompanyUser(["OWNER"]);
  const id = str(fd, "id");
  if (id === me.id) return; // ما بتقدر توقف حالك
  const u = await db.user.findFirst({ where: { id } });
  if (!u) return;
  await db.user.update({ where: { id }, data: { active: !u.active } });
  await db.auditLog.create({ data: { companyId: company.id, userId: me.id, action: u.active ? "user.disable" : "user.enable", details: u.username } });
  revalidatePath("/dashboard/users");
}

export async function changeRoleAction(fd: FormData) {
  const { db, user: me } = await requireCompanyUser(["OWNER"]);
  const id = str(fd, "id");
  const role = str(fd, "role") as UserRole;
  if (id === me.id || !ROLES.includes(role)) return;
  await db.user.update({ where: { id }, data: { role } });
  revalidatePath("/dashboard/users");
}

export async function resetUserPasswordAction(_: FormState, fd: FormData): Promise<FormState> {
  const { db, company, user: me } = await requireCompanyUser(["OWNER"]);
  const id = str(fd, "id");
  const password = String(fd.get("password") ?? "");
  const pp = passwordProblem(password);
  if (pp) return { error: pp };
  const u = await db.user.findFirst({ where: { id } });
  if (!u) return { error: "المستخدم غير موجود" };
  await db.user.update({ where: { id }, data: { passwordHash: await hashPassword(password) } });
  await db.auditLog.create({ data: { companyId: company.id, userId: me.id, action: "user.password_reset", details: u.username } });
  return { ok: `تم تغيير كلمة سر ${u.fullName}` };
}
