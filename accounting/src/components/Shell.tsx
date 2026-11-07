"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

export type NavItem = { href: string; label: string; icon: string; soon?: boolean; exact?: boolean };
export type NavGroup = { title?: string; items: NavItem[] };

export function Shell({
  groups, sub, footer, children,
}: { groups: NavGroup[]; sub: string; footer: React.ReactNode; children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);

  const isActive = (i: NavItem) => (i.exact ? path === i.href : path === i.href || path.startsWith(i.href + "/"));

  return (
    <div className={`shell${open ? " open" : ""}`}>
      <aside className="sidebar">
        <Logo sub={sub} />
        {groups.map((g, gi) => (
          <nav key={gi}>
            {g.title && <div className="nav-section">{g.title}</div>}
            {g.items.map((i) => (
              <Link key={i.href} href={i.soon ? "#" : i.href}
                className={`nav-link${isActive(i) ? " active" : ""}${i.soon ? " disabled" : ""}`}
                aria-disabled={i.soon}>
                <span aria-hidden>{i.icon}</span>
                {i.label}
                {i.soon && <span className="soon">قريباً</span>}
              </Link>
            ))}
          </nav>
        ))}
        <div className="sidebar-foot">{footer}</div>
      </aside>
      {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 15, background: "rgba(0,0,0,.4)" }} />}
      <div className="main">
        <button className="btn btn-ghost btn-sm menu-toggle" onClick={() => setOpen(true)}
          style={{ position: "fixed", bottom: 16, left: 16, zIndex: 10, background: "var(--surface)" }}>☰ القائمة</button>
        {children}
      </div>
    </div>
  );
}

export function PageHeader({ title, actions }: { title: string; actions?: React.ReactNode }) {
  return (
    <header className="topbar">
      <h1>{title}</h1>
      {actions && <div className="row-actions">{actions}</div>}
    </header>
  );
}
