import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import WavyUnderline from '../../components/WavyUnderline';
import { 
  Shield, CheckCircle, Smartphone, Clock, FileText, 
  ArrowRight, Landmark, Briefcase, Car, Bike, HardDrive, HelpCircle
} from 'lucide-react';

export default function Home() {
  const { t } = useLanguage();
  const [animate, setAnimate] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    // Trigger hero animations on mount
    setAnimate(true);
  }, []);

  useEffect(() => {
    // Lightweight scroll-linked parallax for the hero backdrop —
    // one deliberate moment of motion rather than scattered effects.
    function onScroll() { setScrollY(window.scrollY); }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const serviceList = [
    { id: 'personal', title: t('personalLoan'), desc: t('personalLoanDesc'), icon: <Shield className="w-8 h-8 text-[#FF5A1F]" /> },
    { id: 'home', title: t('homeLoan'), desc: t('homeLoanDesc'), icon: <Landmark className="w-8 h-8 text-[#FF5A1F]" /> },
    { id: 'bike', title: t('bikeLoan'), desc: t('bikeLoanDesc'), icon: <Bike className="w-8 h-8 text-[#FF5A1F]" /> },
    { id: 'car', title: t('carLoan'), desc: t('carLoanDesc'), icon: <Car className="w-8 h-8 text-[#FF5A1F]" /> },
    { id: 'emergency', title: t('emergencyLoan'), desc: t('emergencyLoanDesc'), icon: <Clock className="w-8 h-8 text-[#FF5A1F]" /> },
    { id: 'business', title: t('businessLoan'), desc: t('businessLoanDesc'), icon: <Briefcase className="w-8 h-8 text-[#FF5A1F]" /> },
  ];

  const steps = [
    { num: '01', title: t('step1Title'), desc: t('step1Desc') },
    { num: '02', title: t('step2Title'), desc: t('step2Desc') },
    { num: '03', title: t('step3Title'), desc: t('step3Desc') },
    { num: '04', title: t('step4Title'), desc: t('step4Desc') },
    { num: '05', title: t('step5Title'), desc: t('step5Desc') },
    { num: '06', title: t('step6Title'), desc: t('step6Desc') },
  ];

  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <section ref={heroRef} className="relative overflow-hidden min-h-[85vh] flex items-center py-20 border-b border-[#27272A]">
        {/* Backdrop — a single restrained orange field and a pearl sliver,
            both drifting slowly on scroll rather than pulsing. */}
        <div
          className="absolute top-[8%] left-[-12%] w-[38vw] h-[38vw] bg-[#FF5A1F] rounded-full filter blur-[160px] opacity-[0.09] pointer-events-none"
          style={{ transform: `translateY(${scrollY * 0.12}px)` }}
        ></div>
        <div
          className="absolute -bottom-24 right-[-8%] w-[26vw] h-[26vw] bg-[#F4F1E9] rounded-full filter blur-[140px] opacity-[0.04] pointer-events-none"
          style={{ transform: `translateY(${scrollY * -0.08}px)` }}
        ></div>

        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Hero Content */}
          <div className={`flex flex-col gap-6 transition-all duration-1000 transform ${animate ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 text-[#FF5A1F] font-mono-tag text-xs font-semibold w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F]"></span>
              Secure Loan Management Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-white leading-[1.08]">
              {t('heroTitle')} <br />
              <WavyUnderline className="text-[#FF5A1F]">{t('heroTitle2')}</WavyUnderline>
            </h1>
            
            <p className="text-lg md:text-xl text-[#A0A0AB] max-w-lg font-medium leading-relaxed font-['Plus_Jakarta_Sans']">
              {t('heroSubtitle')}
            </p>

            <div className="flex flex-wrap gap-4 mt-4">
              <Link to="/apply" className="btn btn-primary px-8 py-4 text-base">
                {t('applyLoan')}
                <ArrowRight size={18} />
              </Link>
              <a href="#services" className="btn btn-secondary px-8 py-4 text-base border-[#27272A]">
                {t('exploreServices')}
              </a>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className={`relative transition-all duration-1000 delay-300 transform ${animate ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div
              className="w-full max-w-lg mx-auto bg-gradient-to-tr from-[#141416] to-[#1D1D20] p-8 border border-[#27272A] shadow-2xl relative"
              style={{ borderRadius: '40px 40px 40px 8px' }}
            >
              <div className="absolute top-4 right-4 text-xs font-bold text-[#FF5A1F]/60 bg-[#FF5A1F]/5 px-2.5 py-1 rounded-md border border-[#FF5A1F]/10">
                ACTIVE PORTFOLIO
              </div>
              <div className="flex flex-col gap-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#71717A] mb-1">COLLATXSMART CORE</p>
                  <h3 className="text-3xl font-extrabold text-white">Interactive Lab Portal</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#0A0A0B] rounded-xl border border-[#27272A]">
                    <p className="text-xs text-[#A0A0AB] mb-1">Interest Variable</p>
                    <p className="text-2xl font-bold text-white">2% - 10%</p>
                  </div>
                  <div className="p-4 bg-[#0A0A0B] rounded-xl border border-[#27272A]">
                    <p className="text-xs text-[#A0A0AB] mb-1">Coverage Regions</p>
                    <p className="text-lg font-bold text-[#FF5A1F]">Coimbatore & TN</p>
                  </div>
                </div>

                <div className="p-4 bg-[#FF5A1F]/5 border border-[#FF5A1F]/10 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></div>
                    <span className="text-xs font-bold text-[#A0A0AB]">Academic CLF Verified</span>
                  </div>
                  <Link to="/clf-lab" className="text-xs font-extrabold text-[#FF5A1F] hover:underline flex items-center gap-1">
                    Open Lab <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" className="py-24 bg-[#0A0A0B] relative">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="font-mono-tag text-xs text-[#FF5A1F] block mb-3">Six Loan Types</span>
            <h2 className="section-title">
              {t('servicesTitle')}
            </h2>
            <p className="text-[#A0A0AB] font-medium">
              {t('servicesSubtitle')}
            </p>
          </div>

          <div className="grid-3">
            {serviceList.map((service, index) => (
              <div key={service.id} className="card-morph group flex flex-col justify-between h-[300px]">
                <div className="flex flex-col gap-4">
                  <div className="p-3 bg-[#1D1D20] rounded-xl w-fit group-hover:bg-[#FF5A1F]/10 group-hover:scale-110 transition-all duration-300">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold group-hover:text-[#FF5A1F] transition-all">{service.title}</h3>
                  <p className="text-sm text-[#A0A0AB] leading-relaxed">{service.desc}</p>
                </div>
                <Link to="/apply" className="flex items-center gap-1 text-sm font-bold text-white hover:text-[#FF5A1F] transition-all group/btn mt-4">
                  {t('learnMore')}
                  <ArrowRight size={14} className="group-hover/btn:translate-x-1.5 transition-all" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-24 bg-[#141416] border-y border-[#27272A]">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="section-title">
              {t('howItWorksTitle')}
            </h2>
          </div>

          <div className="grid-3 gap-y-12">
            {steps.map((step, index) => (
              <div key={index} className="relative p-6 bg-[#0A0A0B] border border-[#27272A] hover:border-[#FF5A1F]/30 transition-all group" style={{ borderRadius: index % 2 === 0 ? '24px 24px 24px 6px' : '24px 6px 24px 24px' }}>
                <span className="absolute top-4 right-4 font-mono-tag text-3xl font-medium text-[#1D1D20] group-hover:text-[#FF5A1F]/20 transition-all select-none">
                  {step.num}
                </span>
                <div className="flex flex-col gap-3 relative z-10 pt-4">
                  <h3 className="text-lg font-semibold text-white group-hover:text-[#FF5A1F] transition-all">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#A0A0AB] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US SECTION (Cream background contrast style like Vestox) */}
      <section id="why-choose-us" className="py-24 bg-[#F4F3EF] text-[#0A0A0B]">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              {t('whyTitle')}
            </h2>
          </div>

          <div className="grid-2">
            <div className="p-8 bg-[#E2E0D9] flex flex-col justify-between min-h-[220px] transition-all duration-500 hover:bg-white hover:shadow-lg" style={{ borderRadius: '32px 32px 32px 8px' }}>
              <div>
                <h3 className="text-xl font-bold mb-3">{t('why1Title')}</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{t('why1Desc')}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#0A0A0B] text-white flex items-center justify-center font-bold text-sm mt-4">
                01
              </div>
            </div>

            <div className="p-8 bg-[#E2E0D9] flex flex-col justify-between min-h-[220px] transition-all duration-500 hover:bg-white hover:shadow-lg" style={{ borderRadius: '32px 32px 32px 8px' }}>
              <div>
                <h3 className="text-xl font-bold mb-3">{t('why2Title')}</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{t('why2Desc')}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#0A0A0B] text-white flex items-center justify-center font-bold text-sm mt-4">
                02
              </div>
            </div>

            <div className="p-8 bg-[#E2E0D9] flex flex-col justify-between min-h-[220px] transition-all duration-500 hover:bg-white hover:shadow-lg" style={{ borderRadius: '32px 32px 32px 8px' }}>
              <div>
                <h3 className="text-xl font-bold mb-3">{t('why3Title')}</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{t('why3Desc')}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#0A0A0B] text-white flex items-center justify-center font-bold text-sm mt-4">
                03
              </div>
            </div>

            <div className="p-8 bg-[#E2E0D9] flex flex-col justify-between min-h-[220px] transition-all duration-500 hover:bg-white hover:shadow-lg" style={{ borderRadius: '32px 32px 32px 8px' }}>
              <div>
                <h3 className="text-xl font-bold mb-3">{t('why4Title')}</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{t('why4Desc')}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#0A0A0B] text-white flex items-center justify-center font-bold text-sm mt-4">
                04
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 bg-[#0A0A0B] relative overflow-hidden border-t border-[#27272A]">
        <div className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-[60vw] h-[60vw] bg-[#FF5A1F] rounded-full filter blur-[200px] opacity-[0.05] pointer-events-none"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center flex flex-col items-center gap-6">
          <h2 className="text-4xl md:text-6xl font-semibold text-white">
            <WavyUnderline>{t('ctaTitle')}</WavyUnderline>
          </h2>
          <p className="text-lg md:text-xl text-[#A0A0AB] max-w-lg mb-4">
            {t('ctaSubtitle')}
          </p>
          <Link to="/apply" className="btn btn-primary px-10 py-4.5 text-base shadow-xl">
            {t('applyLoan')}
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
