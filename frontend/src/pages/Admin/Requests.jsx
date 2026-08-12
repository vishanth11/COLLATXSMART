import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, Search, Eye, X } from 'lucide-react';

export default function Requests() {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null);
  
  // Approval Form Parameters
  const [approvedAmount, setApprovedAmount] = useState('');
  const [interestRate, setInterestRate] = useState(5.0);
  const [interestMethod, setInterestMethod] = useState('Reducing');
  const [durationMonths, setDurationMonths] = useState(12);
  const [repaymentFreq, setRepaymentFreq] = useState('Monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().substring(0, 10));
  
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/loan-applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setRequests(data.applications || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRequest = (req) => {
    setSelectedReq(req);
    setApprovedAmount(req.requested_amount);
    setDurationMonths(req.requested_duration_months);
    setRepaymentFreq(req.repayment_frequency);
    setMessage('');
    setError('');
  };

  const handleAction = async (status) => {
    setProcessing(true);
    setError('');
    setMessage('');

    try {
      const body = {
        status,
        approved_amount: parseFloat(approvedAmount),
        interest_rate: parseFloat(interestRate),
        interest_method: interestMethod,
        duration_months: parseInt(durationMonths),
        repayment_frequency: repaymentFreq,
        start_date: startDate
      };

      const res = await fetch(`http://localhost:5000/api/loan-applications/${selectedReq.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Action failed');
      }

      setMessage(`Request was successfully ${status}.`);
      setSelectedReq(null);
      fetchRequests();
    } catch (err) {
      setError(err.message || 'Failed to update request.');
    } finally {
      setProcessing(false);
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
        <h1 className="text-3xl font-extrabold text-white">Loan Applications</h1>
        <p className="text-[#A0A0AB] text-sm mt-1">Review pending customer inquiries and evaluate risk profiles</p>
      </div>

      {/* Navigation tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#27272A] pb-4 mb-8">
        <Link to="/admin" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
          Overview
        </Link>
        <Link to="/admin/requests" className="px-4 py-2 border-b-2 border-[#FF5A1F] text-white font-bold text-sm">
          Loan Requests
        </Link>
        <Link to="/admin/customers" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
          Customers
        </Link>
        <Link to="/admin/loans" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
          Active Loans
        </Link>
        <Link to="/admin/payments" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
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

      {message && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm flex items-center gap-3 mb-6">
          <CheckCircle size={18} />
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table of Requests */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="card">
            {requests.length === 0 ? (
              <div className="text-center py-12 text-[#71717A] text-sm">
                No active loan requests found.
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Req ID</th>
                      <th>Customer</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Frequency</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r.id}>
                        <td className="font-bold text-white">CX-{r.id.toString().padStart(6, '0')}</td>
                        <td>{r.full_name}</td>
                        <td>{r.loan_type}</td>
                        <td>₹{r.requested_amount.toLocaleString('en-IN')}</td>
                        <td>{r.repayment_frequency}</td>
                        <td>
                          <span className={`badge ${
                            r.status === 'Approved' ? 'badge-success' :
                            r.status === 'Rejected' ? 'badge-danger' :
                            r.status === 'Submitted' ? 'badge-pending' : 'badge-info'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleSelectRequest(r)}
                            className="btn btn-secondary py-1 px-3 text-xs border-[#27272A] flex items-center gap-1.5"
                          >
                            <Eye size={12} /> Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Inspection Panel Drawer */}
        {selectedReq && (
          <div className="card p-6 h-fit flex flex-col gap-6 relative animate-in slide-in-from-right-4 duration-300">
            <button 
              onClick={() => setSelectedReq(null)}
              className="absolute top-4 right-4 text-[#71717A] hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-bold text-white border-b border-[#27272A] pb-3">Inspect Application</h3>
            
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs flex gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Applicant details */}
            <div className="flex flex-col gap-3 text-xs text-[#A0A0AB] border-b border-[#27272A] pb-4">
              <div>
                <span className="font-bold text-white text-sm">{selectedReq.full_name}</span>
                <span className="text-[10px] text-[#71717A] ml-2 font-mono">USER-ID: {selectedReq.customer_id}</span>
              </div>
              <p>Income: <strong className="text-white">₹{selectedReq.monthly_income?.toLocaleString('en-IN')}</strong> / Month</p>
              <p>Occupation: <strong className="text-white">{selectedReq.occupation}</strong></p>
              <p>Purpose: <strong className="text-white">{selectedReq.purpose || 'N/A'}</strong></p>
              <p>Requested: <strong className="text-white">₹{selectedReq.requested_amount?.toLocaleString('en-IN')}</strong> ({selectedReq.requested_duration_months} Months, {selectedReq.repayment_frequency})</p>
              {selectedReq.collateral_required === 1 && (
                <div className="p-2.5 bg-yellow-500/5 border border-yellow-500/10 rounded-lg mt-1 text-yellow-500">
                  <p className="font-bold">Collateral Pledged: {selectedReq.collateral_type}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{selectedReq.collateral_details}</p>
                </div>
              )}
            </div>

            {/* Approval Parameters form */}
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-bold text-white">Configure Loan Parameters</h4>

              <div className="form-group mb-0">
                <label className="form-label text-xs">Approved Principal Amount (INR)</label>
                <input
                  type="number"
                  className="form-input text-sm"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group mb-0">
                  <label className="form-label text-xs">Interest Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input text-sm"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label text-xs">Interest Method</label>
                  <select
                    className="form-select text-sm"
                    value={interestMethod}
                    onChange={(e) => setInterestMethod(e.target.value)}
                  >
                    <option value="Reducing">Reducing Balance</option>
                    <option value="Flat">Flat</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group mb-0">
                  <label className="form-label text-xs">Duration (Months)</label>
                  <input
                    type="number"
                    className="form-input text-sm"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(e.target.value)}
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label text-xs">Repayment Freq.</label>
                  <select
                    className="form-select text-sm"
                    value={repaymentFreq}
                    onChange={(e) => setRepaymentFreq(e.target.value)}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Daily">Daily</option>
                  </select>
                </div>
              </div>

              <div className="form-group mb-0">
                <label className="form-label text-xs">Start Date (Maturity calculated from this)</label>
                <input
                  type="date"
                  className="form-input text-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#27272A]">
                <button
                  disabled={processing}
                  onClick={() => handleAction('Approved')}
                  className="btn btn-primary text-xs py-2 flex-1"
                >
                  {processing ? 'Processing...' : 'Approve & Disburse'}
                </button>
                <button
                  disabled={processing}
                  onClick={() => handleAction('Rejected')}
                  className="btn btn-secondary text-xs py-2 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20"
                >
                  {processing ? 'Processing...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
