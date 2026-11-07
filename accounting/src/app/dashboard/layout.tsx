import { requireCompanyUser } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/format";
import { Shell } from "@/components/Shell";
import { logoutAction } from "../login/actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, company } = await requireCompanyUser();
  const isOwner = user.role === "OWNER";
  return (
    <Shell
      sub={company.name}
      groups={[
        { items: [{ href: "/dashboard", label: "الرئيسية", icon: "◈", exact: true }] },
        { title: "المحاسبة", items: [
          { href: "/dashboard/accounts", label: "دليل الحسابات", icon: "☰", soon: true },
          { href: "/dashboard/journal", label: "القيود اليومية", icon: "✎", soon: true },
          { href: "/dashboard/vouchers", label: "سندات القبض والصرف", icon: "⇄", soon: true },
        ] },
        { title: "المبيعات والمشتريات", items: [
          { href: "/dashboard/invoices", label: "الفواتير", icon: "▤", soon: true },
          { href: "/dashboard/contacts", label: "الزبائن والموردين", icon: "☺", soon: true },
        ] },
        { title: "التقارير", items: [
          { href: "/dashboard/reports", label: "التقارير المالية", icon: "▥", soon: true },
        ] },
        ...(isOwner ? [{ title: "الإدارة", items: [
          { href: "/dashboard/users", label: "المستخدمين والصلاحيات", icon: "⚿" },
        ] }] : []),
      ]}
      footer={
        <>
          <div className="who">{user.fullName}</div>
          <div style={{ opacity: 0.6, marginBottom: 10 }}>{ROLE_LABELS[user.role]} · <span className="mono">{user.username}</span></div>
          <form action={logoutAction}><button className="btn btn-ghost btn-sm btn-block" style={{ color: "#cfc9bb", borderColor: "rgba(255,255,255,.12)" }}>تسجيل الخروج</button></form>
        </>
      }
    >
      {children}
    </Shell>
  );
}
