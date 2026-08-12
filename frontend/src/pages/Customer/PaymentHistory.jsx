import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';
import { Search, DollarSign } from 'lucide-react';

export default function PaymentHistory() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.customerId) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/payments/customer/${user.customerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPayments(data.payments || []);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">{t('paymentHistory')}</h1>
        <p className="text-[#A0A0AB] text-sm mt-1">Audit log of your direct payments, cash collections, and banking transfers</p>
      </div>

      <div className="flex flex-wrap gap-3 border-b border-[#27272A] pb-4 mb-8">
        <Link to="/customer" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
          {t('dashboard')}
        </Link>
        <Link to="/customer/loan" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
          {t('myLoan')}
        </Link>
        <Link to="/customer/payments" className="px-4 py-2 border-b-2 border-[#FF5A1F] text-white font-bold text-sm">
          {t('paymentHistory')}
        </Link>
        <Link to="/customer/documents" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
          {t('documents')}
        </Link>
      </div>

      <div className="card">
        {payments.length === 0 ? (
          <div className="text-center py-12 text-[#71717A] flex flex-col items-center gap-3">
            <DollarSign size={40} />
            <p>No verified transaction payments found.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('date')}</th>
                  <th>{t('paymentId')}</th>
                  <th>{t('amount')}</th>
                  <th>{t('method')}</th>
                  <th>{t('reference')}</th>
                  <th>{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>{new Date(p.payment_date).toLocaleString('en-GB')}</td>
                    <td className="font-bold text-white">PAY-{p.id.toString().padStart(6, '0')}</td>
                    <td className="font-semibold text-white">₹{p.amount.toLocaleString('en-IN')}</td>
                    <td>{p.payment_method}</td>
                    <td className="font-mono text-xs">{p.reference_number}</td>
                    <td>
                      <span className="badge badge-success">Verified</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
