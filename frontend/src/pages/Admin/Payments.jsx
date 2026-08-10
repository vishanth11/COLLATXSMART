import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';
import { DollarSign, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function Payments() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [customers, setCustomers] = useState([]);
  const [loans, setLoans] = useState([]);
  
  // Selection States
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedLoanId, setSelectedLoanId] = useState('');
  
  // Form Values
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().substring(0, 16));
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Fetch loans when customer is selected
  useEffect(() => {
    if (selectedCustomerId) {
      fetchCustomerLoans(selectedCustomerId);
    } else {
      setLoans([]);
      setSelectedLoanId('');
    }
  }, [selectedCustomerId]);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/customers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCustomers(data.customers || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerLoans = async (customerId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/loans/active/customer/${customerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setLoans(data.loans || []);
          if (data.loans.length > 0) {
            setSelectedLoanId(data.loans[0].id);
          } else {
            setSelectedLoanId('');
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedLoanId || !amount || !referenceNumber) {
      setError('Please fill in all required fields.');
      return;
    }

    setRecording(true);
    setError('');
    setSuccess('');

    try {
      const body = {
        customer_id: parseInt(selectedCustomerId),
        loan_id: parseInt(selectedLoanId),
        amount: parseFloat(amount),
        payment_date: paymentDate,
        payment_method: paymentMethod,
        reference_number: referenceNumber,
        notes
      };

      const res = await fetch('http://localhost:5000/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Payment recording failed');
      }

      setSuccess('Payment recorded successfully. Balance and schedule updated.');
      setAmount('');
      setReferenceNumber('');
      setNotes('');
      
      // Refresh current loans status
      fetchCustomerLoans(selectedCustomerId);
    } catch (err) {
      setError(err.message || 'Failed to record payment.');
    } finally {
      setRecording(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center bg-[#0A0A0B]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#FF5A1F]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Record Transaction</h1>
        <p className="text-[#A0A0AB] text-sm mt-1">Directly credit cash collections, bank checks, or online UPI transactions to active schedules</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#27272A] pb-4 mb-8">
        <Link to="/admin" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
          Overview
        </Link>
        <Link to="/admin/requests" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
          Loan Requests
        </Link>
        <Link to="/admin/customers" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
          Customers
        </Link>
        <Link to="/admin/loans" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
          Active Loans
        </Link>
        <Link to="/admin/payments" className="px-4 py-2 border-b-2 border-[#FF5A1F] text-white font-bold text-sm">
          Record Payment
        </Link>
        <Link to="/admin/collateral" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
          Collateral
        </Link>
        <Link to="/admin/documents" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
          Documents Audit
        </Link>
        <Link to="/admin/reports" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
          Reports Panel
        </Link>
      </div>

      <div className="max-w-xl mx-auto card p-8">
        <h3 className="text-xl font-bold text-white mb-6 border-b border-[#27272A] pb-3 flex items-center gap-2">
          <DollarSign size={20} className="text-[#FF5A1F]" /> Enter Payment Transaction
        </h3>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs flex items-center gap-2 mb-6 animate-shake">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-xs flex items-center gap-2 mb-6">
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleRecordPayment} className="space-y-5">
          {/* Customer Selection */}
          <div className="form-group">
            <label className="form-label">Select Customer</label>
            <select
              className="form-select"
              required
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          {/* Active Loan Selection */}
          <div className="form-group">
            <label className="form-label">Select Active Loan Account</label>
            <select
              className="form-select"
              required
              disabled={loans.length === 0}
              value={selectedLoanId}
              onChange={(e) => setSelectedLoanId(e.target.value)}
            >
              {loans.length === 0 ? (
                <option value="">-- No Active Loans Found --</option>
              ) : (
                <>
                  <option value="">-- Choose Loan Account --</option>
                  {loans.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.loan_type} - Approved: ₹{l.approved_amount.toLocaleString('en-IN')} (Outstanding: ₹{l.outstanding_amount.toLocaleString('en-IN')})
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Payment Amount (INR)</label>
              <input
                type="number"
                required
                className="form-input"
                placeholder="Amount in Rupees"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Date & Time</label>
              <input
                type="datetime-local"
                required
                className="form-input text-sm"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
          </div>

          {/* Method and Reference */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                className="form-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer (IMPS / NEFT)</option>
                <option value="Other">Other Direct Method</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Reference Number (Tx ID)</label>
              <input
                type="text"
                required
                className="form-input font-mono text-sm"
                placeholder="UPI123456789 or Cash Receipt No."
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Administrative Notes</label>
            <textarea
              className="form-textarea text-sm"
              rows={2}
              placeholder="e.g. Collected by Priya at Peelamedu branch..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={recording || loans.length === 0}
            className={`btn btn-primary w-full py-3 text-base flex justify-center items-center gap-2 ${
              recording || loans.length === 0 ? 'btn-disabled' : ''
            }`}
          >
            {recording ? 'Broadcasting Events...' : 'Record Payment & Recalculate'}
          </button>
        </form>
      </div>
    </div>
  );
}
