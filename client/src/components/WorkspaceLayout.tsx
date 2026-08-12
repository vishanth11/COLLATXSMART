import { Bell, ChevronLeft, ChevronRight, LayoutDashboard, LogOut, Menu, PanelLeftClose, PanelLeftOpen, UserRound, X } from "lucide-react";
import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import BrandMark from "./BrandMark";
import LanguageToggle from "./LanguageToggle";

const adminLinks = [
  { href: "/admin", key: "dashboard.overview", icon: LayoutDashboard },
  { href: "/admin/requests", key: "dashboard.requests", icon: Bell },
  { href: "/admin/loans", key: "dashboard.loans", icon: ChevronRight },
  { href: "/admin/customers", key: "dashboard.customers", icon: UserRound },
  { href: "/admin/payments", key: "dashboard.payments", icon: ChevronRight },
  { href: "/admin/collateral", key: "dashboard.collateral", icon: ChevronRight },
  { href: "/admin/documents", key: "dashboard.documents", icon: ChevronRight },
];

const customerLinks = [
  { href: "/customer", key: "dashboard.overview", icon: LayoutDashboard },
  { href: "/customer/loan", key: "dashboard.loans", icon: ChevronRight },
  { href: "/customer/payments", key: "dashboard.payments", icon: ChevronRight },
  { href: "/customer/documents", key: "dashboard.documents", icon: ChevronRight },
  { href: "/customer/profile", key: "dashboard.profile", icon: UserRound },
];

type PreviewUser = { name: string; email: string; role: "admin" | "user" };

export default function WorkspaceLayout({ children, role, previewUser }: { children: ReactNode; role: "admin" | "user"; previewUser?: PreviewUser }) {
  const { t } = useLanguage();
  const auth = useAuth();
  const user = previewUser || auth.user;
  const logout = previewUser ? async () => undefined : auth.logout;
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = role === "admin" ? adminLinks : customerLinks;

  const closeMobile = () => setMobileOpen(false);
  const active = (href: string) => href === "/admin" || href === "/customer" ? location === href : location.startsWith(href);

  return (
    <div className={`workspace-shell ${collapsed ? "is-collapsed" : ""}`}>
      <aside className={`workspace-sidebar ${mobileOpen ? "is-mobile-open" : ""}`}>
        <div className="workspace-sidebar__top">
          <Link href={role === "admin" ? "/admin" : "/customer"} onClick={closeMobile}><BrandMark compact={collapsed} /></Link>
          <button className="sidebar-close-mobile" onClick={closeMobile} aria-label="Close menu"><X size={20} /></button>
        </div>
        <div className="workspace-sidebar__label">{role === "admin" ? t("dashboard.admin") : t("dashboard.customer")}</div>
        <nav className="workspace-nav" aria-label="Workspace navigation">
          {links.map(({ href, key, icon: Icon }) => (
            <Link key={href} href={href} className={active(href) ? "is-active" : ""} onClick={closeMobile}>
              <Icon size={18} />
              <span>{t(key)}</span>
              {active(href) && <span className="nav-active-dot" />}
            </Link>
          ))}
        </nav>
        <div className="workspace-sidebar__bottom">
          <LanguageToggle dark />
          <button className="workspace-user" type="button" onClick={() => logout()}>
            <span className="avatar">{(user?.name || "U").slice(0, 1).toUpperCase()}</span>
            <span className="workspace-user__meta"><strong>{user?.name || "Workspace user"}</strong><small>{t("dashboard.signOut")}</small></span>
            <LogOut size={16} />
          </button>
        </div>
        <button className="sidebar-collapse" type="button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? <PanelLeftOpen size={17} /> : <><PanelLeftClose size={17} /> <span>Collapse</span></>}
        </button>
      </aside>
      {mobileOpen && <button className="workspace-backdrop" type="button" onClick={closeMobile} aria-label="Close navigation" />}
      <main className="workspace-main">
        <header className="workspace-topbar">
          <div className="workspace-topbar__left"><button className="mobile-menu-button" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={21} /></button><div><span className="workspace-kicker">{role === "admin" ? t("dashboard.admin") : t("dashboard.customer")}</span><span className="workspace-breadcrumb">/ {t(active(role === "admin" ? "/admin" : "/customer") ? "dashboard.overview" : "common.viewAll")}</span></div></div>
          <div className="workspace-topbar__right"><span className="workspace-date">{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date())}</span><span className="workspace-topbar__avatar">{(user?.name || "U").slice(0, 1).toUpperCase()}</span></div>
        </header>
        <div className="workspace-content">{children}</div>
      </main>
    </div>
  );
}
