import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Globe, User, LogOut } from 'lucide-react';

export default function Navbar() {
  const { lang, toggleLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'text-orange-500 font-bold' : '';
  };

  // Helper to determine if we are in admin or customer portal
  const isPortal = location.pathname.startsWith('/admin') || location.pathname.startsWith('/customer');

  return (
    <nav className="sticky top-0 z-50 bg-[#0A0A0B]/90 backdrop-blur-md border-b border-[#27272A] py-4 transition-all">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
          <span className="font-display text-xl font-semibold tracking-tight text-white">
            Collat<span className="text-[#FF5A1F]">X</span>Smart
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        {!isPortal ? (
          <div className="hidden md:flex items-center gap-8 text-[0.95rem] font-semibold text-[#A0A0AB]">
            <Link to="/" className="hover:text-white transition-all">{t('home')}</Link>
            <a href="#services" className="hover:text-white transition-all">{t('services')}</a>
            <a href="#how-it-works" className="hover:text-white transition-all">{t('howItWorks')}</a>
            <a href="#why-choose-us" className="hover:text-white transition-all">{t('about')}</a>
            <Link to="/clf-lab" className="hover:text-white transition-all">{t('clfLab')}</Link>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-4 text-[0.95rem] font-semibold text-[#A0A0AB]">
            <span className="text-sm font-normal">
              Logged in as: <strong className="text-white">{user?.name}</strong> ({user?.role})
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#27272A] rounded-lg text-sm text-[#F8F9FA] hover:bg-[#141416] transition-all font-semibold"
          >
            <Globe size={16} className="text-[#FF5A1F]" />
            {lang === 'en' ? 'தமிழ்' : 'English'}
          </button>

          {/* Auth State Button */}
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to={user.role === 'ADMIN' ? '/admin' : '/customer'}
                className="btn btn-primary py-2 text-sm"
              >
                <User size={16} />
                {t('dashboard')}
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-secondary py-2 text-sm border-[#27272A] hover:border-red-500/50 hover:text-red-500"
              >
                <LogOut size={16} />
                {t('logout')}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="btn btn-secondary py-2 text-sm">
                {t('login')}
              </Link>
              <Link to="/apply" className="btn btn-primary py-2 text-sm">
                {t('applyLoan')}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <div className="md:hidden flex items-center gap-3">
          {/* Mobile Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 p-2 border border-[#27272A] rounded-lg text-xs"
          >
            <Globe size={14} className="text-[#FF5A1F]" />
            {lang === 'en' ? 'TA' : 'EN'}
          </button>
          <button onClick={() => setIsOpen(!isOpen)} className="text-[#F8F9FA] focus:outline-none">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="md:hidden bg-[#0A0A0B] border-b border-[#27272A] absolute left-0 right-0 top-[69px] py-6 px-6 flex flex-col gap-4 shadow-lg transition-all animate-in fade-in slide-in-from-top-4 duration-200">
          {!isPortal ? (
            <>
              <Link to="/" onClick={() => setIsOpen(false)} className="hover:text-white py-2 border-b border-[#1D1D20]">{t('home')}</Link>
              <a href="#services" onClick={() => setIsOpen(false)} className="hover:text-white py-2 border-b border-[#1D1D20]">{t('services')}</a>
              <a href="#how-it-works" onClick={() => setIsOpen(false)} className="hover:text-white py-2 border-b border-[#1D1D20]">{t('howItWorks')}</a>
              <a href="#why-choose-us" onClick={() => setIsOpen(false)} className="hover:text-white py-2 border-b border-[#1D1D20]">{t('about')}</a>
              <Link to="/clf-lab" onClick={() => setIsOpen(false)} className="hover:text-white py-2 border-b border-[#1D1D20]">{t('clfLab')}</Link>
            </>
          ) : (
            <div className="py-2 border-b border-[#1D1D20] text-sm">
              Role: <strong className="text-white">{user?.role}</strong>
            </div>
          )}

          {user ? (
            <div className="flex flex-col gap-3 mt-2">
              <Link
                to={user.role === 'ADMIN' ? '/admin' : '/customer'}
                onClick={() => setIsOpen(false)}
                className="btn btn-primary w-full py-2.5 text-center flex justify-center gap-2"
              >
                <User size={16} />
                {t('dashboard')}
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-secondary w-full py-2.5 text-center flex justify-center gap-2 border-[#27272A] text-red-500 hover:bg-red-500/10"
              >
                <LogOut size={16} />
                {t('logout')}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              <Link to="/login" onClick={() => setIsOpen(false)} className="btn btn-secondary w-full py-2.5 text-center">
                {t('login')}
              </Link>
              <Link to="/apply" onClick={() => setIsOpen(false)} className="btn btn-primary w-full py-2.5 text-center">
                {t('applyLoan')}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
