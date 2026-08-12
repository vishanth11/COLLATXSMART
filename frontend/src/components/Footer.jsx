import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Phone, Mail, Award } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#0A0A0B] border-t border-[#27272A] pt-16 pb-8 text-[#A0A0AB]">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Company Info */}
        <div className="flex flex-col gap-4">
          <span className="font-display text-xl font-semibold tracking-tight text-white">
            Collat<span className="text-[#FF5A1F]">X</span>Smart
          </span>
          <p className="text-sm leading-relaxed">
            {t('footerDesc')}
          </p>
          <div className="flex items-center gap-2 text-sm text-[#FF5A1F] font-semibold">
            <Award size={18} />
            <span>Coimbatore Prime Finance Partner</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Services</h4>
          <ul className="flex flex-col gap-2.5 text-sm">
            <li><a href="#services" className="hover:text-white transition-all">{t('personalLoan')}</a></li>
            <li><a href="#services" className="hover:text-white transition-all">{t('homeLoan')}</a></li>
            <li><a href="#services" className="hover:text-white transition-all">{t('bikeLoan')}</a></li>
            <li><a href="#services" className="hover:text-white transition-all">{t('carLoan')}</a></li>
            <li><a href="#services" className="hover:text-white transition-all">{t('emergencyLoan')}</a></li>
            <li><a href="#services" className="hover:text-white transition-all">{t('businessLoan')}</a></li>
          </ul>
        </div>

        {/* Pages */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Links</h4>
          <ul className="flex flex-col gap-2.5 text-sm">
            <li><Link to="/apply" className="hover:text-white transition-all">{t('applyLoan')}</Link></li>
            <li><Link to="/login" className="hover:text-white transition-all">{t('login')}</Link></li>
            <li><Link to="/clf-lab" className="hover:text-white transition-all">{t('clfLab')}</Link></li>
            <li><a href="#how-it-works" className="hover:text-white transition-all">{t('howItWorks')}</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
          <ul className="flex flex-col gap-3 text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin size={18} className="text-[#FF5A1F] shrink-0 mt-0.5" />
              <span>102, Avinashi Road, Peelamedu, Coimbatore - 641004, Tamil Nadu</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={18} className="text-[#FF5A1F]" />
              <span>+91 422 257 1234</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={18} className="text-[#FF5A1F]" />
              <span>info@collatxsmart.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="container mx-auto px-4 pt-8 border-t border-[#1D1D20] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
        <p>{t('copyright')}</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-all">{t('privacyPolicy')}</a>
          <a href="#" className="hover:text-white transition-all">{t('termsOfService')}</a>
        </div>
      </div>
    </footer>
  );
}
