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
      <PageHeader eyebrow={c.subscriptionCode} title={c.name} actions={<><CopyButton text={c.subscriptionCode} label="نسخ رقم الاشتراك" /><Link href="/admin" className="btn btn-ghost btn-sm">→ رجوع</Link></>} />
      <div className="content">
        {created && (
          <div className="alert alert-ok">
            ✔ تم إنشاء الشركة. أرسل للزبون: <strong>رقم الاشتراك</strong> <span className="mono">{c.subscriptionCode}</span>
            {owner && <> · <strong>اسم المستخدم</strong> <span className="mono">{owner.username}</span></>} · وكلمة السر اللي حطيتها.
          </div>
        )}

        <div className="ledger">
          <div><div className="k">الحالة</div><div style={{ marginTop: 12 }}><SubBadge status={c.status} expiresAt={c.expiresAt} /></div></div>
          <div><div className="k">ينتهي في</div><div className="v date">{fmtDate(c.expiresAt)}</div></div>
          <div className={left <= 14 ? "accent" : ""}><div className="k">المتبقي</div><div className="v">{left >= 0 ? left : 0}<small> يوم</small></div><div className="h">{left < 0 ? `منتهي من ${-left} يوم` : " "}</div></div>
          <div><div className="k">المستخدمين</div><div className="v">{c.users.length}<small> / {c.maxUsers}</small></div></div>
        </div>

        <div className="card">
          <div className="card-title">التجديد والتحكم</div>
          <div className="row-actions">
            {[1, 3, 6, 12].map((m) => (
              <form key={m} action={extendSubscriptionAction}>
                <input type="hidden" name="id" value={c.id} /><input type="hidden" name="months" value={m} />
                <button className="btn">+ تمديد {m === 12 ? "سنة" : m === 1 ? "شهر" : `${m} شهور`}</button>
              </form>
            ))}
            <form action={setStatusAction} style={{ marginInlineStart: "auto" }}>
              <input type="hidden" name="id" value={c.id} />
              <input type="hidden" name="status" value={c.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE"} />
              {c.status === "ACTIVE"
                ? <button className="btn btn-danger">إيقاف الاشتراك</button>
                : <button className="btn btn-primary">إعادة التفعيل</button>}
            </form>
          </div>
        </div>

        <div className="grid grid-2" style={{ alignItems: "start" }}>
          <div className="card">
            <div className="card-title">تعديل البيانات</div>
            <EditCompanyForm c={{ id: c.id, name: c.name, phone: c.phone ?? "", taxNumber: c.taxNumber ?? "", city: c.city ?? "", notes: c.notes ?? "", maxUsers: c.maxUsers, expiresAt: c.expiresAt.toISOString().slice(0, 10) }} />
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
                      <td><span className="badge badge-accent">{ROLE_LABELS[u.role]}</span>{!u.active && <> <span className="badge badge-danger">موقوف</span></>}</td>
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
