import { ArrowDownRight, ArrowUpRight, Bike, BriefcaseBusiness, CarFront, ChartNoAxesCombined, FileCheck2, HandCoins, HeartHandshake, Home as HomeIcon, Landmark, ShieldCheck, Siren, WalletCards } from "lucide-react";
import { Link } from "wouter";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { useLanguage } from "@/contexts/LanguageContext";

const products = [
  { key: "personal", icon: HandCoins, number: "01", tone: "orange" },
  { key: "home", icon: HomeIcon, number: "02", tone: "pearl" },
  { key: "bike", icon: Bike, number: "03", tone: "charcoal" },
  { key: "car", icon: CarFront, number: "04", tone: "pearl" },
  { key: "emergency", icon: Siren, number: "05", tone: "orange" },
  { key: "business", icon: BriefcaseBusiness, number: "06", tone: "charcoal" },
];

export default function Home() {
  const { t } = useLanguage();
  return (
    <div className="public-site">
      <PublicHeader />
      <main>
        <section className="hero-section">
          <div className="hero-grid-lines" />
          <div className="site-container hero-section__inner">
            <div className="hero-copy">
              <p className="eyebrow eyebrow--light"><span className="eyebrow-line" />{t("hero.eyebrow")}</p>
              <h1>{t("hero.title")}<em>{t("hero.titleAccent")}</em></h1>
              <p className="hero-copy__body">{t("hero.body")}</p>
              <div className="hero-copy__actions"><Link href="/apply" className="button button--orange button--large">{t("hero.apply")} <ArrowUpRight size={18} /></Link><a href="#services" className="text-link text-link--light">{t("hero.explore")} <ArrowDownRight size={16} /></a></div>
              <div className="hero-note"><span className="status-pip" />{t("hero.note")}</div>
            </div>
            <div className="hero-visual" aria-label="CollatXSmart financial overview illustration">
              <div className="hero-orbit hero-orbit--one" /><div className="hero-orbit hero-orbit--two" />
              <div className="hero-visual__halo" />
              <div className="hero-mini-card hero-mini-card--top"><span>LOAN / 2026</span><strong>Simple next steps</strong><small>Personalised assessment</small></div>
              <div className="hero-visual__core"><div className="core-ring"><div className="core-center"><Landmark size={34} /><span>CS</span></div></div><div className="core-label"><span>COLLATX</span><strong>SMART</strong></div></div>
              <div className="hero-mini-card hero-mini-card--bottom"><span className="mini-label">APPLICATION HEALTH</span><div className="mini-progress"><span /></div><strong>Clear at a glance</strong></div>
              <span className="hero-float hero-float--one"><ChartNoAxesCombined size={16} /> Transparent tracking</span><span className="hero-float hero-float--two"><ShieldCheck size={16} /> Human-led review</span>
            </div>
          </div>
          <div className="hero-ribbon"><div className="site-container hero-ribbon__inner"><span>Personal</span><i /> <span>Home</span><i /> <span>Business</span><i /> <span>Emergency</span><i /> <span>Vehicle</span><i /> <span>Local support</span></div></div>
        </section>

        <section className="section section--pearl" id="services">
          <div className="site-container">
            <div className="section-heading section-heading--split"><div><p className="eyebrow"><span className="eyebrow-line" />{t("services.eyebrow")}</p><h2>{t("services.heading")}</h2></div><p>{t("services.body")}</p></div>
            <div className="product-grid">{products.map(({ key, icon: Icon, number, tone }) => <article className={`product-card product-card--${tone}`} key={key}><div className="product-card__top"><span className="product-number">{number}</span><span className="product-icon"><Icon size={22} /></span></div><div><h3>{t(`service.${key}.title`)}</h3><p>{t(`service.${key}.body`)}</p></div><Link href={`/apply?type=${key}`} className="product-card__link">{t("common.learnMore")} <ArrowUpRight size={15} /></Link></article>)}</div>
          </div>
        </section>

        <section className="section section--dark" id="how-it-works">
          <div className="site-container">
            <div className="section-heading"><p className="eyebrow eyebrow--light"><span className="eyebrow-line" />{t("process.eyebrow")}</p><h2>{t("process.heading")}</h2></div>
            <div className="process-grid">{[1, 2, 3, 4, 5, 6].map((step) => <div className="process-step" key={step}><span>0{step}</span><div className="process-step__line" /><strong>{t(`process.${step}`)}</strong></div>)}</div>
            <div className="process-callout"><div className="process-callout__mark"><WalletCards size={24} /></div><p>We keep the journey moving with clear updates, practical verification, and a team you can reach.</p><Link href="/apply" className="text-link text-link--light">Start the journey <ArrowUpRight size={16} /></Link></div>
          </div>
        </section>

        <section className="section section--cream" id="about">
          <div className="site-container">
            <div className="section-heading section-heading--split"><div><p className="eyebrow"><span className="eyebrow-line" />{t("why.eyebrow")}</p><h2>{t("why.heading")}</h2></div><div className="section-heading__aside"><span className="big-number">06</span><p>Thoughtful tools for every stage of the loan journey.</p></div></div>
            <div className="benefit-grid"><article><div className="benefit-icon"><HandCoins size={20} /></div><h3>{t("why.flexible")}</h3><p>{t("why.flexibleBody")}</p></article><article><div className="benefit-icon"><ChartNoAxesCombined size={20} /></div><h3>{t("why.tracking")}</h3><p>{t("why.trackingBody")}</p></article><article><div className="benefit-icon"><FileCheck2 size={20} /></div><h3>{t("why.secure")}</h3><p>{t("why.secureBody")}</p></article><article><div className="benefit-icon"><HeartHandshake size={20} /></div><h3>{t("why.support")}</h3><p>{t("why.supportBody")}</p></article></div>
          </div>
        </section>

        <section className="cta-section" id="contact"><div className="site-container cta-section__inner"><div><p className="eyebrow eyebrow--light"><span className="eyebrow-line" />{t("cta.eyebrow")}</p><h2>{t("cta.heading")}</h2><p>{t("cta.body")}</p></div><Link href="/apply" className="button button--cream button--large">{t("nav.apply")} <ArrowUpRight size={18} /></Link></div></section>
      </main>
      <PublicFooter />
    </div>
  );
}
