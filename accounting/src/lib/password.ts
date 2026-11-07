import "server-only";
import bcrypt from "bcryptjs";

export const hashPassword = (plain: string) => bcrypt.hash(plain, 12);
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);

// مقارنة وهمية لما المستخدم مش موجود، عشان ما ينعرف من سرعة الرد إذا الاسم موجود
let dummy: string | null = null;
export async function fakeVerify(plain: string) {
  dummy ??= await bcrypt.hash("not-a-real-password", 12);
  await bcrypt.compare(plain, dummy);
  return false;
}

export function passwordProblem(p: string): string | null {
  if (p.length < 8) return "كلمة السر لازم تكون 8 أحرف على الأقل";
  if (!/[A-Za-z؀-ۿ]/.test(p) || !/\d/.test(p)) return "كلمة السر لازم تحتوي أحرف وأرقام";
  return null;
}
