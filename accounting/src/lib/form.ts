export type FormState = { error?: string; ok?: string; data?: Record<string, string> } | undefined;

export const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
