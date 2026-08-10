import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Download, Calendar, FileSpreadsheet } from 'lucide-react';

export default function Reports() {
  const { token } = useAuth();
  
  // Date filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  const [exportingType, setExportingType] = useState(null);

  const handleExportCSV = async (type) => {
    setExportingType(type);
    try {
      // Build query string
      let url = `http://localhost:5000/api/reports/export/${type}`;
      const params = [];
      if (fromDate) params.push(`from=${fromDate}`);
      if (toDate) params.push(`to=${toDate}`);
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to generate report export');
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `collatx_${type}_report_${new Date().toISOString().substring(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      alert(err.message || 'Report export failed.');
    } finally {
      setExportingType(null);
    }
  };

  const reportCard = (title, desc, type) => (
    <div className="card p-6 flex flex-col justify-between min-h-[180px]">
      <div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-xs text-[#A0A0AB] leading-relaxed">{desc}</p>
      </div>
      <button
        disabled={exportingType !== null}
        onClick={() => handleExportCSV(type)}
        className="btn btn-primary py-2 text-xs w-full flex items-center justify-center gap-2 mt-4"
      >
        <Download size={14} />
        {exportingType === type ? 'Streaming CSV...' : 'Export to CSV'}
      </button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Financial Reports Panel</h1>
        <p className="text-[#A0A0AB] text-sm mt-1">Export relational system datasets as streamable spreadsheet models</p>
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
        <Link to="/admin/payments" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
          Record Payment
        </Link>
        <Link to="/admin/collateral" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
          Collateral
        </Link>
        <Link to="/admin/documents" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
          Documents Audit
        </Link>
        <Link to="/admin/reports" className="px-4 py-2 border-b-2 border-[#FF5A1F] text-white font-bold text-sm">
          Reports Panel
        </Link>
      </div>

      {/* Range Date Filters */}
      <div className="card p-5 mb-8 flex flex-col md:flex-row items-center gap-6">
        <div className="flex items-center gap-2 text-[#FF5A1F] font-bold text-sm">
          <Calendar size={18} />
          <span>Filter Datasets By Range:</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 flex-1 w-full">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <span className="text-xs text-[#A0A0AB] font-bold">FROM:</span>
            <input
              type="date"
              className="form-input text-xs"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <span className="text-xs text-[#A0A0AB] font-bold">TO:</span>
            <input
              type="date"
              className="form-input text-xs"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          {(fromDate || toDate) && (
            <button
              onClick={() => { setFromDate(''); setToDate(''); }}
              className="btn btn-secondary py-1.5 px-3 text-xs border-[#27272A]"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Grid of Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCard('Loan Disbursements', 'Detailed log of approved loans, approved principal amounts, and interest methods.', 'loans')}
        {reportCard('Payment Transactions', 'Records of client payments, reference numbers, date credits, and recorded administrators.', 'payments')}
        {reportCard('Outstanding Ledger', 'Clients with active balances showing paid amounts and outstanding balances.', 'outstanding')}
        {reportCard('Overdue Installments', 'Lists installments that have passed their due dates without being paid in full.', 'overdue')}
        {reportCard('Collateral holdings', 'Audited values, descriptions, verification levels, and holding statuses.', 'collateral')}
      </div>
    </div>
  );
}
