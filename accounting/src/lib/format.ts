import { LOCALE } from "./brand";

export const fmtDate = (d: Date | string) =>
  new Intl.DateTimeFormat("ar-JO", { dateStyle: "medium", numberingSystem: "latn", timeZone: LOCALE.timeZone }).format(new Date(d));

/** مبلغ بالدينار: 1,250.500 */
export const fmtMoney = (n: number) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: LOCALE.decimals, maximumFractionDigits: LOCALE.decimals }).format(n);

export const daysLeft = (d: Date) => Math.ceil((d.getTime() - Date.now()) / 86_400_000);

export const ROLE_LABELS = { OWNER: "مدير", ACCOUNTANT: "محاسب", VIEWER: "مشاهد" } as const;
