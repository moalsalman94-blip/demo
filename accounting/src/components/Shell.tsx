"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

export type NavItem = { href: string; label: string; soon?: boolean; exact?: boolean };
export type NavGroup = { items: NavItem[] };

export function Shell({
  groups, org, me, children,
}: {
  groups: NavGroup[];
  org: { title: string; sub: string };
  me: { name: string; sub: string; logout: () => Promise<void> };
  children: React.ReactNode;
}) {
  const path = usePathname();
  const isActive = (i: NavItem) => (i.exact ? path === i.href : path === i.href || path.startsWith(i.href + "/"));

  return (
    <div className="app">
      <header className="appbar">
        <div className="appbar-row">
          <Logo />
          <div className="org"><strong>{org.title}</strong><span className="muted">{org.sub}</span></div>
          <div className="me">
            <div className="me-text"><strong>{me.name}</strong><div className="muted">{me.sub}</div></div>
            <span className="avatar" aria-hidden>{me.name.trim().charAt(0)}</span>
            <form action={me.logout}><button className="btn btn-sm">خروج</button></form>
          </div>
        </div>
        <nav className="tabs" aria-label="القائمة">
          {groups.map((g, gi) => (
            <span key={gi} style={{ display: "contents" }}>
              {gi > 0 && <span className="tab-sep" aria-hidden />}
              {g.items.map((i) =>
                i.soon ? (
                  <span key={i.href} className="tab disabled" aria-disabled>{i.label}<span className="soon">قريباً</span></span>
                ) : (
                  <Link key={i.href} href={i.href} className={`tab${isActive(i) ? " active" : ""}`} aria-current={isActive(i) ? "page" : undefined}>
                    {i.label}
                  </Link>
                ),
              )}
            </span>
          ))}
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}

export function PageHeader({ title, eyebrow, actions }: { title: string; eyebrow?: string; actions?: React.ReactNode }) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <div className="eyebrow" style={{ marginBottom: 6 }}>{eyebrow}</div>}
        <h1>{title}</h1>
      </div>
      {actions && <div className="row-actions">{actions}</div>}
    </div>
  );
}
