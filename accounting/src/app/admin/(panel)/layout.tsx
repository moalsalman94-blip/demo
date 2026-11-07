import { requireAdmin } from "@/lib/auth";
import { Shell } from "@/components/Shell";
import { adminLogoutAction } from "../login/actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <Shell
      org={{ title: "لوحة المالك", sub: "إدارة الاشتراكات" }}
      me={{ name: admin.username, sub: "مالك النظام", logout: adminLogoutAction }}
      groups={[{ items: [
        { href: "/admin", label: "الشركات والاشتراكات", exact: true },
        { href: "/admin/companies/new", label: "+ شركة جديدة" },
      ] }]}
    >
      {children}
    </Shell>
  );
}
