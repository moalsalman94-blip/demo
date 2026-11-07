import { requireAdmin } from "@/lib/auth";
import { Shell } from "@/components/Shell";
import { adminLogoutAction } from "../login/actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <Shell
      sub="لوحة المالك"
      groups={[{ items: [
        { href: "/admin", label: "الشركات والاشتراكات", icon: "▣", exact: true },
        { href: "/admin/companies/new", label: "شركة جديدة", icon: "＋" },
      ] }]}
      footer={
        <>
          <div className="who">{admin.username}</div>
          <div style={{ opacity: 0.6, marginBottom: 10 }}>مالك البرنامج</div>
          <form action={adminLogoutAction}><button className="btn btn-ghost btn-sm btn-block" style={{ color: "#cfc9bb", borderColor: "rgba(255,255,255,.12)" }}>تسجيل الخروج</button></form>
        </>
      }
    >
      {children}
    </Shell>
  );
}
