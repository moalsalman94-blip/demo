import { requireCompanyUser } from "@/lib/auth";
import { LOCALE } from "@/lib/brand";
import { fmtDate, fmtMoney, daysLeft } from "@/lib/format";
import { PageHeader } from "@/components/Shell";

export default async function DashboardHome({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const { denied } = await searchParams;
  const { user, company, db } = await requireCompanyUser();
  const usersCount = await db.user.count();
  const left = daysLeft(company.expiresAt);
  const hour = Number(new Intl.DateTimeFormat("en", { hour: "numeric", hourCycle: "h23", timeZone: LOCALE.timeZone }).format(new Date()));
  const month = new Intl.DateTimeFormat("ar-JO", { month: "long", year: "numeric", numberingSystem: "latn", timeZone: LOCALE.timeZone }).format(new Date());
  const cur = <small>{LOCALE.currencySymbol}</small>;

  return (
    <>
      <PageHeader eyebrow={`${hour < 12 ? "صباح الخير" : "مساء الخير"} · ${month}`} title={user.fullName} />
      <div className="content">
        {denied && <div className="alert alert-error">ما عندك صلاحية لهاي الصفحة.</div>}
        {left <= 14 && (
          <div className="alert alert-warn">اشتراك الشركة بينتهي خلال {left} يوم ({fmtDate(company.expiresAt)}). تواصل معنا للتجديد.</div>
        )}

        <div className="ledger">
          <div><div className="k">الإيرادات</div><div className="v">{cur}{fmtMoney(0)}</div><div className="h">هذا الشهر</div></div>
          <div><div className="k">المصاريف</div><div className="v">{cur}{fmtMoney(0)}</div><div className="h">هذا الشهر</div></div>
          <div><div className="k">صافي الربح</div><div className="v">{cur}{fmtMoney(0)}</div><div className="h">قبل الضريبة</div></div>
          <div className="accent"><div className="k">الاشتراك</div><div className="v">{left}<small> يوم</small></div><div className="h">ينتهي {fmtDate(company.expiresAt)}</div></div>
        </div>

        <div className="grid grid-2" style={{ alignItems: "start" }}>
          <div className="card">
            <div className="card-title"><span>خطوات البداية</span><span className="eyebrow">Setup</span></div>
            {["جهّز دليل الحسابات", "أضف الزبائن والموردين", "ابدأ بإصدار الفواتير والقيود"].map((t, i) => (
              <div key={t} style={{ display: "flex", gap: 14, alignItems: "center", padding: "10px 0", borderBottom: i < 2 ? "1px dashed var(--hair)" : 0 }}>
                <span className="mono" style={{ fontWeight: 700, color: "var(--accent)" }}>0{i + 1}</span>
                <span style={{ flex: 1 }}>{t}</span>
                <span className="badge badge-muted">قريباً</span>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-title"><span>بيانات الشركة</span><span className="eyebrow">Company</span></div>
            <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "auto 1fr", gap: "10px 20px" }}>
              <dt className="muted">الاسم</dt><dd style={{ margin: 0 }}>{company.name}</dd>
              <dt className="muted">رقم الاشتراك</dt><dd style={{ margin: 0 }} className="mono">{company.subscriptionCode}</dd>
              <dt className="muted">الرقم الضريبي</dt><dd style={{ margin: 0 }} className="mono">{company.taxNumber || "—"}</dd>
              <dt className="muted">العملة</dt><dd style={{ margin: 0 }}>دينار أردني ({LOCALE.currency})</dd>
              <dt className="muted">المستخدمين</dt><dd style={{ margin: 0 }} className="num">{usersCount} / {company.maxUsers}</dd>
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}
