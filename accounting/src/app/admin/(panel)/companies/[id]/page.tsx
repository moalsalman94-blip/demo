import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { fmtDate, daysLeft, ROLE_LABELS } from "@/lib/format";
import { PageHeader } from "@/components/Shell";
import { SubBadge } from "@/components/SubBadge";
import { CopyButton } from "@/components/CopyButton";
import { extendSubscriptionAction, setStatusAction } from "../../../actions";
import { EditCompanyForm, ResetPasswordForm } from "./forms";

export default async function CompanyPage({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { id } = await params;
  const { created } = await searchParams;
  const c = await prisma.company.findUnique({
    where: { id },
    include: {
      users: { orderBy: { createdAt: "asc" }, select: { id: true, username: true, fullName: true, role: true, active: true, lastLoginAt: true } },
      auditLogs: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!c) notFound();
  const left = daysLeft(c.expiresAt);
  const owner = c.users.find((u) => u.role === "OWNER");

  return (
    <>
      <PageHeader title={c.name} actions={<Link href="/admin" className="btn btn-ghost btn-sm">→ رجوع</Link>} />
      <div className="content">
        {created && (
          <div className="alert alert-ok">
            ✔ تم إنشاء الشركة. أرسل للزبون: <strong>رقم الاشتراك</strong> <span className="mono">{c.subscriptionCode}</span>
            {owner && <> · <strong>اسم المستخدم</strong> <span className="mono">{owner.username}</span></>} · وكلمة السر اللي حطيتها.
          </div>
        )}

        <div className="grid grid-stats">
          <div className="card stat">
            <div className="stat-label">رقم الاشتراك</div>
            <div className="stat-value mono" style={{ fontSize: 17, display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", whiteSpace: "nowrap" }}>
              {c.subscriptionCode} <CopyButton text={c.subscriptionCode} />
            </div>
          </div>
          <div className="card stat">
            <div className="stat-label">الحالة</div>
            <div style={{ marginTop: 10 }}><SubBadge status={c.status} expiresAt={c.expiresAt} /></div>
          </div>
          <div className="card stat">
            <div className="stat-label">ينتهي في</div>
            <div className="stat-value" style={{ fontSize: 20 }}>{fmtDate(c.expiresAt)}</div>
            <div className="stat-hint">{left >= 0 ? `باقي ${left} يوم` : `منتهي من ${-left} يوم`}</div>
          </div>
          <div className="card stat">
            <div className="stat-label">المستخدمين</div>
            <div className="stat-value">{c.users.length} <span className="muted" style={{ fontSize: 15 }}>/ {c.maxUsers}</span></div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">التجديد والتحكم</div>
          <div className="row-actions">
            {[1, 3, 6, 12].map((m) => (
              <form key={m} action={extendSubscriptionAction}>
                <input type="hidden" name="id" value={c.id} /><input type="hidden" name="months" value={m} />
                <button className="btn btn-ghost">＋ تمديد {m === 12 ? "سنة" : m === 1 ? "شهر" : `${m} شهور`}</button>
              </form>
            ))}
            <form action={setStatusAction} style={{ marginInlineStart: "auto" }}>
              <input type="hidden" name="id" value={c.id} />
              <input type="hidden" name="status" value={c.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE"} />
              {c.status === "ACTIVE"
                ? <button className="btn btn-danger">إيقاف الاشتراك</button>
                : <button className="btn btn-gold">إعادة التفعيل</button>}
            </form>
          </div>
        </div>

        <div className="grid grid-2" style={{ alignItems: "start" }}>
          <div className="card">
            <div className="card-title">تعديل البيانات</div>
            <EditCompanyForm c={{ id: c.id, name: c.name, phone: c.phone ?? "", notes: c.notes ?? "", maxUsers: c.maxUsers, expiresAt: c.expiresAt.toISOString().slice(0, 10) }} />
          </div>
          <div className="card">
            <div className="card-title">مستخدمين الشركة</div>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>المستخدم</th><th>الدور</th><th>آخر دخول</th></tr></thead>
                <tbody>
                  {c.users.map((u) => (
                    <tr key={u.id}>
                      <td><strong>{u.fullName}</strong><div className="muted small mono">{u.username}</div></td>
                      <td><span className="badge badge-gold">{ROLE_LABELS[u.role]}</span>{!u.active && <> <span className="badge badge-danger">موقوف</span></>}</td>
                      <td className="small muted">{u.lastLoginAt ? fmtDate(u.lastLoginAt) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 40 }}>
              <div className="card-title" style={{ fontSize: 15 }}>إعادة تعيين كلمة سر</div>
              <ResetPasswordForm users={c.users.map((u) => ({ id: u.id, label: `${u.fullName} (${u.username})` }))} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">آخر النشاطات</div>
          {c.auditLogs.length === 0 ? <div className="empty">ما في نشاط لسا</div> : (
            <div className="table-wrap"><table className="table"><tbody>
              {c.auditLogs.map((l) => (
                <tr key={l.id}><td className="mono small">{l.action}</td><td className="small">{l.details}</td><td className="small muted">{fmtDate(l.createdAt)}</td></tr>
              ))}
            </tbody></table></div>
          )}
        </div>
      </div>
    </>
  );
}
