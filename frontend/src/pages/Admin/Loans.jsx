import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Search, CreditCard, Shield } from 'lucide-react';

export default function Loans() {
  const { token } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/loans', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setLoans(data.loans || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLoans = loans.filter(l => 
    l.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.loan_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <h1 className="text-3xl font-extrabold text-white">Active Loan Accounts</h1>
        <p className="text-[#A0A0AB] text-sm mt-1">Track active principal, configured interest method, and repayments</p>
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
        <Link to="/admin/loans" className="px-4 py-2 border-b-2 border-[#FF5A1F] text-white font-bold text-sm">
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

      {/* Search */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="form-input pl-10"
            placeholder="Search by client name, loan type, status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Loans Table */}
      <div className="card">
        {filteredLoans.length === 0 ? (
          <div className="text-center py-12 text-[#71717A] text-sm">
            No active loan accounts match your query.
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Loan ID</th>
                  <th>Client</th>
                  <th>Type</th>
                  <th>Approved</th>
                  <th>Interest</th>
                  <th>Paid</th>
                  <th>Outstanding</th>
                  <th>Frequency</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.map((l) => (
                  <tr key={l.id}>
                    <td className="font-bold text-white">CX-LN-{l.id.toString().padStart(6, '0')}</td>
                    <td className="font-bold text-[#FF5A1F]">{l.full_name}</td>
                    <td>{l.loan_type}</td>
                    <td className="font-semibold text-white">₹{l.approved_amount.toLocaleString('en-IN')}</td>
                    <td>
                      <div className="flex flex-col text-[11px]">
                        <span>{l.interest_rate}% p.a.</span>
                        <span className="text-[#71717A]">{l.interest_method}</span>
                      </div>
                    </td>
                    <td className="text-green-500">₹{l.amount_paid.toLocaleString('en-IN')}</td>
                    <td className="font-bold text-white">₹{l.outstanding_amount.toLocaleString('en-IN')}</td>
                    <td>{l.repayment_frequency}</td>
                    <td>
                      <span className={`badge ${
                        l.status === 'Completed' || l.status === 'Closed' ? 'badge-success' :
                        l.status === 'Overdue' ? 'badge-danger' : 'badge-info'
                      }`}>
                        {l.status}
                      </span>
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
