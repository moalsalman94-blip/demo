import "server-only";
import { prisma } from "./db";

const WINDOW_MIN = 15;
// حساب واحد: 5 محاولات غلط خلال 15 دقيقة بتقفله مؤقتاً.
// نفس الـ IP: حد أعلى، لأن موظفين المكتب الواحد غالباً بيطلعوا من نفس الـ IP.
export const LIMITS = { account: 5, ip: 40 } as const;

export async function isLocked(key: string, max: number = LIMITS.account) {
  const since = new Date(Date.now() - WINDOW_MIN * 60_000);
  const fails = await prisma.loginAttempt.count({
    where: { key, success: false, createdAt: { gte: since } },
  });
  return fails >= max;
}

export async function recordAttempt(key: string, success: boolean) {
  if (success) {
    await prisma.loginAttempt.deleteMany({ where: { key } });
  } else {
    await prisma.loginAttempt.create({ data: { key, success } });
  }
}
