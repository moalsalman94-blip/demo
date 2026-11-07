import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) throw new Error("حط ADMIN_USERNAME و ADMIN_PASSWORD بملف .env");
  if (password.length < 10) throw new Error("ADMIN_PASSWORD لازم يكون 10 أحرف على الأقل");

  await prisma.superAdmin.upsert({
    where: { username },
    update: { passwordHash: await bcrypt.hash(password, 12) },
    create: { username, passwordHash: await bcrypt.hash(password, 12) },
  });
  console.log(`✔ حساب المالك جاهز: ${username}`);
}

main().finally(() => prisma.$disconnect());
