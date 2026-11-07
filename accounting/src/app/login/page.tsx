import { redirect } from "next/navigation";
import { getCompanySession } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

const NOTICES: Record<string, string> = {
  expired: "انتهى اشتراك شركتك. تواصل معنا للتجديد.",
  suspended: "اشتراك شركتك موقوف حالياً. تواصل مع الدعم.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ blocked?: string }> }) {
  const { blocked } = await searchParams;
  const s = await getCompanySession();
  if (s && !s.block) redirect("/dashboard");

  return (
    <main className="auth">
      <section className="auth-brand">
        <Logo sub={BRAND.tagline} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <span className="badge badge-gold">سحابي · آمن · من أي مكان</span>
          <h1>حسابات شركتك<br />بدقة وفخامة.</h1>
          <p>قيود، فواتير، تقارير مالية، وصلاحيات لفريقك. كل شركة ببيانات معزولة ومحمية بالكامل.</p>
          <div className="auth-features">
            <div><span>◆</span> بيانات كل شركة منفصلة ومشفرة الاتصال</div>
            <div><span>◆</span> صلاحيات: مدير، محاسب، مشاهد</div>
            <div><span>◆</span> تقارير مالية لحظية</div>
          </div>
        </div>
        <small style={{ color: "#7d7869", position: "relative", zIndex: 1 }}>© {new Date().getFullYear()} {BRAND.name}</small>
      </section>
      <section className="auth-form">
        <div className="card">
          <h2>تسجيل الدخول</h2>
          <p className="muted small" style={{ marginTop: 0, marginBottom: 24 }}>أدخل رقم اشتراك شركتك وبيانات حسابك</p>
          <LoginForm notice={blocked ? NOTICES[blocked] : undefined} />
        </div>
      </section>
    </main>
  );
}
