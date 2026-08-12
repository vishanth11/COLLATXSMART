import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import BrandMark from "./BrandMark";
import LanguageToggle from "./LanguageToggle";

export default function PublicHeader() {
  const { t } = useLanguage();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const items = [
    { href: "/", label: t("nav.home") },
    { href: "/#services", label: t("nav.services") },
    { href: "/#how-it-works", label: t("nav.how") },
    { href: "/#about", label: t("nav.about") },
    { href: "/clf-lab", label: t("nav.lab") },
  ];
  const lightHeader = location !== "/";

  return (
    <header className={`public-header ${lightHeader ? "public-header--light" : ""}`}>
      <div className="site-container public-header__inner">
        <Link href="/" onClick={() => setOpen(false)}><BrandMark /></Link>
        <nav className={`public-nav ${open ? "is-open" : ""}`} aria-label="Main navigation">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className={location === item.href ? "is-active" : ""} onClick={() => setOpen(false)}>{item.label}</Link>
          ))}
          <div className="public-nav__mobile-actions">
            <LanguageToggle />
            <Link href="/login" className="button button--ghost" onClick={() => setOpen(false)}>{t("nav.login")}</Link>
            <Link href="/apply" className="button button--orange" onClick={() => setOpen(false)}>{t("nav.apply")}</Link>
          </div>
        </nav>
        <div className="public-header__actions">
          <LanguageToggle />
          <Link href="/login" className="button button--ghost button--small">{t("nav.login")}</Link>
          <Link href="/apply" className="button button--orange button--small">{t("nav.apply")}</Link>
        </div>
        <button className="menu-trigger" type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
}
