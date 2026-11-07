import "server-only";
import { prisma } from "./db";

const WINDOW_MIN = 15;
const MAX_FAILS = 5;

// بعد 5 محاولات غلط خلال 15 دقيقة بينقفل الدخول مؤقتاً
export async function isLocked(key: string) {
  const since = new Date(Date.now() - WINDOW_MIN * 60_000);
  const fails = await prisma.loginAttempt.count({
    where: { key, success: false, createdAt: { gte: since } },
  });
  return fails >= MAX_FAILS;
}

export async function recordAttempt(key: string, success: boolean) {
  if (success) {
    await prisma.loginAttempt.deleteMany({ where: { key } });
  } else {
    await prisma.loginAttempt.create({ data: { key, success } });
  }
}
