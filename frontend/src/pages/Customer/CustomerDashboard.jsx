import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  CreditCard, Calendar, AlertTriangle, ArrowUpRight, 
  Clock, DollarSign, Download, CheckCircle 
} from 'lucide-react';

export default function CustomerDashboard() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const [loan, setLoan] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.customerId) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch active loan
      const loanRes = await fetch(`http://localhost:5000/api/loans/customer/${user.customerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (loanRes.ok) {
        const loanData = await loanRes.json();
        if (loanData.success && loanData.loan) {
          setLoan(loanData.loan);
          
          // 2. Fetch schedule
          const schedRes = await fetch(`http://localhost:5000/api/payment-schedule/${loanData.loan.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (schedRes.ok) {
            const schedData = await schedRes.json();
            if (schedData.success) {
              setSchedule(schedData.schedule || []);
            }
          }

          // 3. Fetch payments
          const payRes = await fetch(`http://localhost:5000/api/payments/customer/${user.customerId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (payRes.ok) {
            const payData = await payRes.json();
            if (payData.success) {
              setPayments(payData.payments || []);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching customer dashboard data:', err);
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

  // Calculate Next Due Installment
  const nextDue = schedule.find(item => item.status === 'Due' || item.status === 'Overdue' || item.status === 'Upcoming');
  
  // Calculate Penalty
  const totalPenalty = schedule.reduce((sum, item) => sum + item.penalty, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">
            {t('welcomeCustomer')}, {user?.name}
          </h1>
          <p className="text-[#A0A0AB] text-sm mt-1">
            Manage your loan repayments, schedules, and collateral documents
          </p>
        </div>
        <Link to="/apply" className="btn btn-primary text-sm py-2">
          {t('requestAnotherLoan')}
          <ArrowUpRight size={16} />
        </Link>
      </div>

      {!loan ? (
        <div className="card text-center py-16 flex flex-col items-center gap-4">
          <CreditCard size={48} className="text-[#71717A]" />
          <h2 className="text-xl font-bold text-white">{t('noActiveLoan')}</h2>
          <p className="text-sm text-[#A0A0AB] max-w-sm">
            Apply for a Personal, Home, Bike, Car, Emergency, or Business loan today. Our team processes verification quickly.
          </p>
          <Link to="/apply" className="btn btn-primary mt-2">
            {t('applyLoan')}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Key Stat Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Active Loan & Outstanding */}
            <div className="card p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-[#A0A0AB] uppercase tracking-wider">{t('activeLoan')} (Approved)</p>
                  <h3 className="text-3xl font-extrabold text-white mt-1">₹{loan.approved_amount.toLocaleString('en-IN')}</h3>
                </div>
                <div className="p-2 bg-[#FF5A1F]/10 rounded-lg text-[#FF5A1F]">
                  <CreditCard size={20} />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#27272A] flex justify-between text-xs text-[#A0A0AB]">
                <span>Principal: ₹{loan.principal_amount.toLocaleString('en-IN')}</span>
                <span>Rate: {loan.interest_rate}% ({loan.interest_method})</span>
              </div>
            </div>

            {/* Outstanding & Paid */}
            <div className="card p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-[#A0A0AB] uppercase tracking-wider">{t('outstanding')}</p>
                  <h3 className="text-3xl font-extrabold text-white mt-1">₹{loan.outstanding_amount.toLocaleString('en-IN')}</h3>
                </div>
                <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                  <Clock size={20} />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#27272A] flex justify-between text-xs text-[#A0A0AB]">
                <span className="text-green-500">Paid: ₹{loan.amount_paid.toLocaleString('en-IN')}</span>
                <span>Total: ₹{loan.total_payable.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Next Installment & Penalty */}
            <div className="card p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-[#A0A0AB] uppercase tracking-wider">{t('nextPayment')}</p>
                  <h3 className="text-3xl font-extrabold text-[#FF5A1F] mt-1">
                    ₹{nextDue ? (nextDue.amount_due + nextDue.penalty - nextDue.amount_paid).toLocaleString('en-IN') : '0'}
                  </h3>
                </div>
                <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                  <Calendar size={20} />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#27272A] flex justify-between text-xs text-[#A0A0AB]">
                <span>Due Date: {nextDue ? new Date(nextDue.due_date).toLocaleDateString('en-GB') : 'N/A'}</span>
                <span className={totalPenalty > 0 ? 'text-red-500 font-bold' : ''}>
                  {t('penalty')}: ₹{totalPenalty}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links Menu for Portals */}
          <div className="flex flex-wrap gap-3 border-b border-[#27272A] pb-4">
            <Link to="/customer" className="px-4 py-2 border-b-2 border-[#FF5A1F] text-white font-bold text-sm">
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

          {/* Schedule & Recent Payments Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Installment Schedule */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <h2 className="text-xl font-bold text-white">{t('paymentSchedule')}</h2>
              
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>{t('installment')}</th>
                      <th>{t('dueDate')}</th>
                      <th>{t('amount')}</th>
                      <th>{t('paid')}</th>
                      <th>{t('penalty')}</th>
                      <th>{t('status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.slice(0, 6).map((item) => (
                      <tr key={item.id}>
                        <td className="font-bold">#{item.installment_number}</td>
                        <td>{new Date(item.due_date).toLocaleDateString('en-GB')}</td>
                        <td>₹{item.amount_due.toLocaleString('en-IN')}</td>
                        <td className="text-green-500">₹{item.amount_paid.toLocaleString('en-IN')}</td>
                        <td className={item.penalty > 0 ? 'text-red-500 font-bold' : 'text-[#71717A]'}>
                          ₹{item.penalty}
                        </td>
                        <td>
                          <span className={`badge ${
                            item.status === 'Paid' ? 'badge-success' :
                            item.status === 'Overdue' ? 'badge-danger' :
                            item.status === 'Due' ? 'badge-pending' : 'badge-info'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {schedule.length > 6 && (
                <Link to="/customer/loan" className="text-sm font-bold text-[#FF5A1F] hover:underline self-end">
                  View Full Schedule ({schedule.length} installments) →
                </Link>
              )}
            </div>

            {/* Recent Payments */}
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-white">{t('recentPayments')}</h2>
              
              <div className="flex flex-col gap-3">
                {payments.length === 0 ? (
                  <div className="p-6 bg-[#141416] rounded-xl border border-[#27272A] text-center text-sm text-[#71717A]">
                    No payments recorded yet.
                  </div>
                ) : (
                  payments.slice(0, 4).map((p) => (
                    <div key={p.id} className="p-4 bg-[#141416] border border-[#27272A] rounded-xl flex justify-between items-center">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-white">₹{p.amount.toLocaleString('en-IN')}</span>
                        <span className="text-xs text-[#71717A]">{p.payment_method} • {p.reference_number}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-[#A0A0AB] block">{new Date(p.payment_date).toLocaleDateString('en-GB')}</span>
                        <span className="text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full uppercase">Verified</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {payments.length > 4 && (
                <Link to="/customer/payments" className="text-sm font-bold text-[#FF5A1F] hover:underline self-end">
                  View All Payments →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
