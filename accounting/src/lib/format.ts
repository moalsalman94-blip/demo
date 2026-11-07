export const fmtDate = (d: Date | string) =>
  new Intl.DateTimeFormat("ar", { dateStyle: "medium", numberingSystem: "latn" }).format(new Date(d));

export const daysLeft = (d: Date) => Math.ceil((d.getTime() - Date.now()) / 86_400_000);

export const ROLE_LABELS = { OWNER: "مدير", ACCOUNTANT: "محاسب", VIEWER: "مشاهد" } as const;
