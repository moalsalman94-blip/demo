import { randomInt } from "crypto";

// أحرف بدون الأشياء اللي بتلخبط (O و 0، I و 1)
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const block = (n: number) =>
  Array.from({ length: n }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");

/** رقم اشتراك بالشكل: ACC-7K3P-92QX */
export const generateSubscriptionCode = () => `ACC-${block(4)}-${block(4)}`;

export const normalizeCode = (c: string) => c.trim().toUpperCase().replace(/\s+/g, "");
