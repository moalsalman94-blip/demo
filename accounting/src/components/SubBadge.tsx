import { daysLeft } from "@/lib/format";

export function SubBadge({ status, expiresAt }: { status: string; expiresAt: Date }) {
  if (status !== "ACTIVE") return <span className="badge badge-danger">موقوف</span>;
  const d = daysLeft(expiresAt);
  if (d < 0) return <span className="badge badge-danger">منتهي</span>;
  if (d <= 14) return <span className="badge badge-warn">ينتهي خلال {d} يوم</span>;
  return <span className="badge badge-ok">فعّال</span>;
}
