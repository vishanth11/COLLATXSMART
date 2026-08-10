import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';
import { User, Phone, Mail, MapPin, Briefcase, Landmark } from 'lucide-react';

export default function Profile() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      // If customer, fetch from customer details endpoint
      const url = user.role === 'CUSTOMER' 
        ? `http://localhost:5000/api/customers/user/${user.id}`
        : `http://localhost:5000/api/auth/me`;
      
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setProfile(user.role === 'CUSTOMER' ? data.customer : data.user);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#FF5A1F]"></div>
      </div>
    );
  }

  const detailItem = (icon, label, value) => (
    <div className="flex gap-4 items-start p-4 bg-[#141416] border border-[#27272A] rounded-xl">
      <div className="p-2.5 bg-[#1D1D20] text-[#FF5A1F] rounded-lg shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-[#71717A] uppercase font-bold tracking-wider">{label}</p>
        <p className="text-white font-bold mt-1 text-base">{value || 'N/A'}</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">{t('profile')}</h1>
        <p className="text-[#A0A0AB] text-sm mt-1">Verify and manage your accounts profile settings</p>
      </div>

      <div className="flex flex-wrap gap-3 border-b border-[#27272A] pb-4 mb-8">
        <Link to="/customer" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
          {t('dashboard')}
        </Link>
        <Link to="/customer/loan" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
          {t('myLoan')}
        </Link>
        <Link to="/customer/payments" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
          {t('paymentHistory')}
        </Link>
        <Link to="/customer/documents" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
          {t('documents')}
        </Link>
      </div>

      <div className="max-w-3xl mx-auto card p-8 flex flex-col gap-6">
        <div className="flex items-center gap-4 border-b border-[#27272A] pb-6">
          <div className="w-16 h-16 rounded-full bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 flex items-center justify-center text-[#FF5A1F]">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{profile?.full_name || profile?.name}</h2>
            <span className="badge badge-info mt-1 text-[10px]">{user?.role}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {detailItem(<Mail size={18} />, 'Email Address', profile?.email)}
          {detailItem(<Phone size={18} />, 'Phone Number', profile?.phone)}
          {user.role === 'CUSTOMER' && (
            <>
              {detailItem(<Briefcase size={18} />, 'Occupation', profile?.occupation)}
              {detailItem(<Landmark size={18} />, 'Monthly Income', `₹${profile?.monthly_income?.toLocaleString('en-IN')}`)}
              <div className="col-span-1 md:col-span-2">
                {detailItem(<MapPin size={18} />, 'Residential Address', profile?.address)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
