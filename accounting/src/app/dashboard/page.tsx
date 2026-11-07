import { requireCompanyUser } from "@/lib/auth";
import { fmtDate, daysLeft } from "@/lib/format";
import { PageHeader } from "@/components/Shell";

export default async function DashboardHome({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const { denied } = await searchParams;
  const { user, company, db } = await requireCompanyUser();
  const usersCount = await db.user.count();
  const left = daysLeft(company.expiresAt);
  const hour = new Date().getHours();

  return (
    <>
      <PageHeader title="الرئيسية" />
      <div className="content">
        {denied && <div className="alert alert-error">ما عندك صلاحية لهاي الصفحة.</div>}
        {left <= 14 && (
          <div className="alert alert-warn">
            اشتراك الشركة بينتهي خلال {left} يوم ({fmtDate(company.expiresAt)}). تواصل معنا للتجديد.
          </div>
        )}

        <div className="card" style={{ background: "linear-gradient(135deg, var(--navy), var(--navy-2))", color: "#efe9dc", border: 0 }}>
          <div style={{ fontSize: 13, color: "#d4b06a" }}>{hour < 12 ? "صباح الخير" : "مساء الخير"}</div>
          <h2 style={{ fontSize: 26, marginTop: 4 }}>{user.fullName}</h2>
          <p style={{ color: "#b8b3a7", margin: "6px 0 0" }}>{company.name} · رقم الاشتراك <span className="mono">{company.subscriptionCode}</span></p>
        </div>

        <div className="grid grid-stats">
          <div className="card stat"><div className="stat-label">الإيرادات (هذا الشهر)</div><div className="stat-value">0.00</div><div className="stat-hint">بتشتغل مع الفواتير</div></div>
          <div className="card stat"><div className="stat-label">المصاريف (هذا الشهر)</div><div className="stat-value">0.00</div><div className="stat-hint">بتشتغل مع السندات</div></div>
          <div className="card stat"><div className="stat-label">صافي الربح</div><div className="stat-value">0.00</div><div className="stat-hint">—</div></div>
          <div className="card stat"><div className="stat-label">الاشتراك</div><div className="stat-value" style={{ fontSize: 20 }}>{left} يوم</div><div className="stat-hint">ينتهي {fmtDate(company.expiresAt)}</div></div>
        </div>

        <div className="grid grid-2">
          <div className="card">
            <div className="card-title">ابدأ من هون</div>
            <ol className="muted" style={{ margin: 0, paddingInlineStart: 20, display: "grid", gap: 8 }}>
              <li>جهّز دليل الحسابات (قريباً)</li>
              <li>أضف الزبائن والموردين (قريباً)</li>
              <li>ابدأ بإصدار الفواتير والقيود (قريباً)</li>
            </ol>
          </div>
          <div className="card">
            <div className="card-title">فريق العمل</div>
            <div className="stat-value">{usersCount} <span className="muted" style={{ fontSize: 15 }}>/ {company.maxUsers} مستخدم</span></div>
          </div>
        </div>
      </div>
    </>
  );
}
