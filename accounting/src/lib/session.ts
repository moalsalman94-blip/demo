import { SignJWT, jwtVerify } from "jose";

// هاد الملف بيشتغل كمان بالـ middleware، فما فيه أي اتصال بقاعدة البيانات

export const USER_COOKIE = "acc_session";
export const ADMIN_COOKIE = "acc_admin";
export const SESSION_DAYS = 7;

export type UserToken = { kind: "user"; uid: string; cid: string };
export type AdminToken = { kind: "admin"; aid: string };
export type SessionToken = UserToken | AdminToken;

function secretKey() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET لازم يكون 32 حرف أو أكثر");
  return new TextEncoder().encode(s);
}

export async function signToken(payload: SessionToken) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey());
}

export async function verifyToken<T extends SessionToken>(
  token: string | undefined,
  kind: T["kind"],
): Promise<T | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    return payload.kind === kind ? (payload as unknown as T) : null;
  } catch {
    return null;
  }
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_DAYS * 24 * 60 * 60,
};
