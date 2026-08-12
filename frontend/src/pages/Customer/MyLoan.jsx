import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { CreditCard, Calendar, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyLoan() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const [loan, setLoan] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.customerId) {
      fetchLoanDetails();
    }
  }, [user]);

  const fetchLoanDetails = async () => {
    try {
      const loanRes = await fetch(`http://localhost:5000/api/loans/customer/${user.customerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (loanRes.ok) {
        const data = await loanRes.json();
        if (data.success && data.loan) {
          setLoan(data.loan);

          const schedRes = await fetch(`http://localhost:5000/api/payment-schedule/${data.loan.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (schedRes.ok) {
            const schedData = await schedRes.json();
            if (schedData.success) {
              setSchedule(schedData.schedule || []);
            }
          }
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
        <h1 className="text-3xl font-extrabold text-white">{t('myLoan')}</h1>
        <p className="text-[#A0A0AB] text-sm mt-1">Detailed terms and configuration of your active loan</p>
      </div>

      <div className="flex flex-wrap gap-3 border-b border-[#27272A] pb-4 mb-8">
        <Link to="/customer" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
          {t('dashboard')}
        </Link>
        <Link to="/customer/loan" className="px-4 py-2 border-b-2 border-[#FF5A1F] text-white font-bold text-sm">
          {t('myLoan')}
        </Link>
        <Link to="/customer/payments" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
          {t('paymentHistory')}
        </Link>
        <Link to="/customer/documents" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
          {t('documents')}
        </Link>
      </div>

      {!loan ? (
        <div className="card text-center py-16 text-[#71717A]">
          No loan details found.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Loan Details Card */}
          <div className="card p-6 flex flex-col gap-6 h-fit">
            <h3 className="text-xl font-bold text-white border-b border-[#27272A] pb-3">Loan Terms</h3>
            
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div>
                <p className="text-[#71717A] text-xs uppercase font-bold">Loan ID</p>
                <p className="text-white font-semibold mt-0.5">CX-LN-{loan.id.toString().padStart(6, '0')}</p>
              </div>
              <div>
                <p className="text-[#71717A] text-xs uppercase font-bold">Loan Type</p>
                <p className="text-white font-semibold mt-0.5">{loan.loan_type}</p>
              </div>
              <div>
                <p className="text-[#71717A] text-xs uppercase font-bold">Principal Amount</p>
                <p className="text-white font-semibold mt-0.5">₹{loan.principal_amount.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-[#71717A] text-xs uppercase font-bold">Approved Amount</p>
                <p className="text-white font-semibold mt-0.5">₹{loan.approved_amount.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-[#71717A] text-xs uppercase font-bold">Interest Rate</p>
                <p className="text-white font-semibold mt-0.5">{loan.interest_rate}% p.a.</p>
              </div>
              <div>
                <p className="text-[#71717A] text-xs uppercase font-bold">Calculation Method</p>
                <p className="text-white font-semibold mt-0.5">{loan.interest_method} Balance</p>
              </div>
              <div>
                <p className="text-[#71717A] text-xs uppercase font-bold">Duration</p>
                <p className="text-white font-semibold mt-0.5">{loan.duration_months} Months</p>
              </div>
              <div>
                <p className="text-[#71717A] text-xs uppercase font-bold">Repayment Frequency</p>
                <p className="text-white font-semibold mt-0.5">{loan.repayment_frequency}</p>
              </div>
              <div>
                <p className="text-[#71717A] text-xs uppercase font-bold">Start Date</p>
                <p className="text-white font-semibold mt-0.5">{new Date(loan.start_date).toLocaleDateString('en-GB')}</p>
              </div>
              <div>
                <p className="text-[#71717A] text-xs uppercase font-bold">Maturity Date</p>
                <p className="text-white font-semibold mt-0.5">{new Date(loan.end_date).toLocaleDateString('en-GB')}</p>
              </div>
            </div>

            <div className="p-4 bg-[#1D1D20] border border-[#27272A] rounded-xl text-center">
              <span className="text-xs text-[#A0A0AB]">Loan Account Status:</span>
              <span className="badge badge-success block w-fit mx-auto mt-1.5">{loan.status}</span>
            </div>
          </div>

          {/* Full Installment Schedule Table */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h3 className="text-xl font-bold text-white">Full Repayment Schedule</h3>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Installment</th>
                    <th>Due Date</th>
                    <th>Amount Due</th>
                    <th>Amount Paid</th>
                    <th>Penalty</th>
                    <th>Remaining</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((item) => (
                    <tr key={item.id}>
                      <td className="font-bold">#{item.installment_number}</td>
                      <td>{new Date(item.due_date).toLocaleDateString('en-GB')}</td>
                      <td>₹{item.amount_due.toLocaleString('en-IN')}</td>
                      <td className="text-green-500">₹{item.amount_paid.toLocaleString('en-IN')}</td>
                      <td className={item.penalty > 0 ? 'text-red-500 font-bold' : 'text-[#71717A]'}>
                        ₹{item.penalty}
                      </td>
                      <td>₹{item.remaining_amount.toLocaleString('en-IN')}</td>
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
          </div>
        </div>
      )}
    </div>
  );
}
