import { ArrowUpRight, MapPin } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import BrandMark from "./BrandMark";

export default function PublicFooter() {
  const { t } = useLanguage();
  return (
    <footer className="public-footer">
      <div className="site-container">
        <div className="public-footer__top">
          <div>
            <BrandMark />
            <p className="public-footer__tagline">{t("brand.tagline")}</p>
            <p className="public-footer__location"><MapPin size={15} />{t("footer.location")}</p>
          </div>
          <div className="public-footer__links">
            <div><span className="footer-label">Explore</span><Link href="/#services">{t("nav.services")}</Link><Link href="/#how-it-works">{t("nav.how")}</Link><Link href="/apply">{t("nav.apply")}</Link></div>
            <div><span className="footer-label">Workspace</span><Link href="/login">{t("nav.login")}</Link><Link href="/clf-lab">{t("nav.lab")}</Link><Link href="/#contact">{t("nav.contact")}</Link></div>
          </div>
          <div className="public-footer__contact"><span className="footer-label">Start a conversation</span><a href="mailto:hello@collatxsmart.in">hello@collatxsmart.in <ArrowUpRight size={15} /></a><a href="tel:+919876543210">+91 98765 43210</a></div>
        </div>
        <div className="public-footer__bottom"><span>© 2026 CollatXSmart</span><div><a href="#privacy">{t("footer.privacy")}</a><a href="#terms">{t("footer.terms")}</a></div></div>
      </div>
    </footer>
  );
}
