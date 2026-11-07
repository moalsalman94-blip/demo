import { requireCompanyUser } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/format";
import { Shell } from "@/components/Shell";
import { logoutAction } from "../login/actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, company } = await requireCompanyUser();
  return (
    <Shell
      org={{ title: company.name, sub: company.subscriptionCode }}
      me={{ name: user.fullName, sub: `${ROLE_LABELS[user.role]} · ${user.username}`, logout: logoutAction }}
      groups={[
        { items: [{ href: "/dashboard", label: "الرئيسية", exact: true }] },
        { items: [
          { href: "/dashboard/accounts", label: "دليل الحسابات", soon: true },
          { href: "/dashboard/journal", label: "القيود اليومية", soon: true },
          { href: "/dashboard/vouchers", label: "السندات", soon: true },
          { href: "/dashboard/invoices", label: "الفواتير", soon: true },
          { href: "/dashboard/contacts", label: "الزبائن والموردين", soon: true },
          { href: "/dashboard/reports", label: "التقارير", soon: true },
        ] },
        ...(user.role === "OWNER" ? [{ items: [{ href: "/dashboard/users", label: "المستخدمين" }] }] : []),
      ]}
    >
      {children}
    </Shell>
  );
}
