"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma, type CompanyStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { generateSubscriptionCode } from "@/lib/codes";
import { hashPassword, passwordProblem } from "@/lib/password";
import { str, type FormState } from "@/lib/form";

const USERNAME_RE = /^[a-z0-9._-]{3,32}$/;

export async function createCompanyAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const name = str(fd, "name");
  const phone = str(fd, "phone");
  const months = Number(str(fd, "months") || 12);
  const maxUsers = Number(str(fd, "maxUsers") || 5);
  const ownerName = str(fd, "ownerName");
  const username = str(fd, "username").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const data = { name, phone, months: String(months), maxUsers: String(maxUsers), ownerName, username };

  if (!name || !ownerName || !username) return { error: "عبّي كل الحقول المطلوبة", data };
  if (!USERNAME_RE.test(username)) return { error: "اسم المستخدم: أحرف إنجليزية صغيرة وأرقام فقط (3-32)", data };
  const pp = passwordProblem(password);
  if (pp) return { error: pp, data };
  if (!(months >= 1 && months <= 120)) return { error: "مدة الاشتراك غير صحيحة", data };
  if (!(maxUsers >= 1 && maxUsers <= 500)) return { error: "عدد المستخدمين غير صحيح", data };

  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + months);
  const passwordHash = await hashPassword(password);

  // نحاول كذا مرة لو صار تكرار برقم الاشتراك (نادر جداً)
  let companyId: string | null = null;
  for (let i = 0; i < 5 && !companyId; i++) {
    try {
      const company = await prisma.company.create({
        data: {
          name, phone: phone || null, expiresAt, maxUsers,
          subscriptionCode: generateSubscriptionCode(),
          users: { create: { username, fullName: ownerName, passwordHash, role: "OWNER" } },
        },
      });
      companyId = company.id;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue;
      throw e;
    }
  }
  if (!companyId) return { error: "صار خطأ، جرب مرة تانية", data };
  revalidatePath("/admin");
  redirect(`/admin/companies/${companyId}?created=1`);
}

export async function extendSubscriptionAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const months = Number(str(fd, "months"));
  if (!id || !(months >= 1 && months <= 120)) return;
  const c = await prisma.company.findUniqueOrThrow({ where: { id } });
  // التمديد بيبلش من تاريخ الانتهاء لو لسا ساري، أو من اليوم لو منتهي
  const base = c.expiresAt > new Date() ? new Date(c.expiresAt) : new Date();
  base.setMonth(base.getMonth() + months);
  await prisma.company.update({ where: { id }, data: { expiresAt: base } });
  await prisma.auditLog.create({ data: { companyId: id, action: "subscription.extend", details: `${months} شهر` } });
  revalidatePath("/admin", "layout");
}

export async function setStatusAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const status = str(fd, "status") as CompanyStatus;
  if (!id || !["ACTIVE", "SUSPENDED"].includes(status)) return;
  await prisma.company.update({ where: { id }, data: { status } });
  await prisma.auditLog.create({ data: { companyId: id, action: `subscription.${status.toLowerCase()}` } });
  revalidatePath("/admin", "layout");
}

export async function updateCompanyAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = str(fd, "id");
  const name = str(fd, "name");
  const phone = str(fd, "phone");
  const notes = str(fd, "notes");
  const maxUsers = Number(str(fd, "maxUsers"));
  const expiresAt = new Date(str(fd, "expiresAt"));
  if (!name) return { error: "اسم الشركة مطلوب" };
  if (!(maxUsers >= 1 && maxUsers <= 500)) return { error: "عدد المستخدمين غير صحيح" };
  if (isNaN(expiresAt.getTime())) return { error: "تاريخ الانتهاء غير صحيح" };
  expiresAt.setHours(23, 59, 59, 0);
  await prisma.company.update({
    where: { id },
    data: { name, phone: phone || null, notes: notes || null, maxUsers, expiresAt },
  });
  revalidatePath("/admin", "layout");
  return { ok: "تم الحفظ" };
}

export async function adminResetPasswordAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const userId = str(fd, "userId");
  const password = String(fd.get("password") ?? "");
  const pp = passwordProblem(password);
  if (pp) return { error: pp };
  const u = await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(password), active: true },
    include: { company: { select: { subscriptionCode: true } } },
  });
  await prisma.auditLog.create({ data: { companyId: u.companyId, action: "user.password_reset_by_admin", details: u.username } });
  await prisma.loginAttempt.deleteMany({ where: { key: `user:${u.company.subscriptionCode}:${u.username}` } });
  return { ok: `تم تغيير كلمة سر ${u.username}` };
}
