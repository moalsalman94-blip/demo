import { redirect } from "next/navigation";
import { getCompanySession } from "@/lib/auth";
import { BRAND, LOCALE } from "@/lib/brand";
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
    <div className="auth">
      <header className="auth-top">
        <Logo size={22} />
        <span className="eyebrow">{BRAND.tagline} · {LOCALE.country}</span>
      </header>

      <div className="auth-body">
        <section className="auth-hero">
          <div className="eyebrow">مدين = دائن</div>
          <div className="huge"><Logo /></div>
          <h1>دفاتر شركتك كلها بمكان واحد، مرتبة ومتوازنة ومعك وين ما كنت.</h1>
          <div className="auth-points">
            <div><span className="num">{LOCALE.currency}</span>بالدينار الأردني</div>
            <div><span className="num">{LOCALE.vatRate}%</span>ضريبة المبيعات</div>
            <div><span className="num">1:1</span>بيانات معزولة لكل شركة</div>
          </div>
        </section>

        <section className="auth-panel">
          <div className="ticket">
            <div className="ticket-head">
              <div className="eyebrow">Sign in · تسجيل الدخول</div>
              <h2>أهلاً فيك</h2>
            </div>
            <div className="ticket-body">
              <LoginForm notice={blocked ? NOTICES[blocked] : undefined} />
            </div>
          </div>
        </section>
      </div>

      <footer className="auth-foot small muted">
        <span>© {new Date().getFullYear()} {BRAND.name}</span>
        <span className="mono">SECURE · TLS · ISOLATED</span>
      </footer>
    </div>
  );
}
