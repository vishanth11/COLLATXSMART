import { ArrowLeft, ArrowUpRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { startLogin } from "@/const";
import { useLanguage } from "@/contexts/LanguageContext";
import BrandMark from "@/components/BrandMark";
import LanguageToggle from "@/components/LanguageToggle";

export default function Login() {
  const { t } = useLanguage();
  return (
    <div className="auth-page">
      <div className="auth-page__panel auth-page__panel--dark"><Link href="/" className="auth-back"><ArrowLeft size={16} /> {t("login.back")}</Link><div className="auth-brand"><BrandMark /><span className="auth-brand__rule" /></div><div className="auth-quote"><p>“A clearer way to understand the next financial step.”</p><span>CollatXSmart / Coimbatore</span></div><div className="auth-orbit" /></div>
      <div className="auth-page__panel auth-page__panel--light"><div className="auth-page__tools"><LanguageToggle /><span className="auth-page__index">01 / 01</span></div><div className="auth-card"><div className="auth-card__icon"><LockKeyhole size={22} /></div><p className="eyebrow"><span className="eyebrow-line" />{t("login.eyebrow")}</p><h1>{t("login.heading")}</h1><p className="auth-card__body">{t("login.body")}</p><button type="button" className="button button--orange button--large button--full" onClick={() => startLogin()}>{t("login.button")} <ArrowUpRight size={18} /></button><div className="auth-safe"><ShieldCheck size={17} /><span>{t("login.note")}</span></div><p className="auth-card__small">By continuing, you agree to use CollatXSmart only for your own financial information.</p></div></div>
    </div>
  );
}
