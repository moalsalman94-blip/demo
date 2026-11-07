import Link from "next/link";
import { prisma } from "@/lib/db";
import { fmtDate, daysLeft } from "@/lib/format";
import { PageHeader } from "@/components/Shell";
import { SubBadge } from "@/components/SubBadge";

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const term = q.trim();
  const companies = await prisma.company.findMany({
    where: term ? { OR: [
      { name: { contains: term, mode: "insensitive" } },
      { subscriptionCode: { contains: term.toUpperCase() } },
    ] } : undefined,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { users: true } } },
  });

  const all = await prisma.company.findMany({ select: { status: true, expiresAt: true } });
  const active = all.filter((c) => c.status === "ACTIVE" && daysLeft(c.expiresAt) >= 0).length;
  const soon = all.filter((c) => c.status === "ACTIVE" && daysLeft(c.expiresAt) >= 0 && daysLeft(c.expiresAt) <= 14).length;

  return (
    <>
      <PageHeader title="الشركات والاشتراكات" actions={<Link href="/admin/companies/new" className="btn btn-gold">＋ شركة جديدة</Link>} />
      <div className="content">
        <div className="grid grid-stats">
          <div className="card stat"><div className="stat-label">كل الشركات</div><div className="stat-value">{all.length}</div></div>
          <div className="card stat"><div className="stat-label">اشتراكات فعّالة</div><div className="stat-value" style={{ color: "var(--ok)" }}>{active}</div></div>
          <div className="card stat"><div className="stat-label">تنتهي خلال أسبوعين</div><div className="stat-value" style={{ color: "var(--warn)" }}>{soon}</div></div>
          <div className="card stat"><div className="stat-label">منتهية أو موقوفة</div><div className="stat-value" style={{ color: "var(--danger)" }}>{all.length - active}</div></div>
        </div>

        <div className="card">
          <div className="card-title">
            <span>قائمة الشركات</span>
            <form style={{ display: "flex", gap: 8 }}>
              <input name="q" defaultValue={q} className="input" placeholder="بحث بالاسم أو رقم الاشتراك" style={{ minWidth: 240 }} />
            </form>
          </div>
          {companies.length === 0 ? (
            <div className="empty">{term ? "ما في نتائج" : "لسا ما في شركات. ابدأ بإضافة أول زبون."}</div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>الشركة</th><th>رقم الاشتراك</th><th>المستخدمين</th><th>ينتهي في</th><th>الحالة</th><th></th></tr></thead>
                <tbody>
                  {companies.map((c) => (
                    <tr key={c.id}>
                      <td><strong>{c.name}</strong>{c.phone && <div className="muted small mono">{c.phone}</div>}</td>
                      <td className="mono">{c.subscriptionCode}</td>
                      <td>{c._count.users} / {c.maxUsers}</td>
                      <td>{fmtDate(c.expiresAt)}</td>
                      <td><SubBadge status={c.status} expiresAt={c.expiresAt} /></td>
                      <td><Link href={`/admin/companies/${c.id}`} className="btn btn-ghost btn-sm">إدارة</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
