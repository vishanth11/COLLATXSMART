import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';
import { 
  Users, FileEdit, CheckCircle2, AlertTriangle, 
  TrendingUp, Landmark, Shield, FileCheck, ArrowRight 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

export default function AdminDashboard() {
  const { token, t } = useAuth();
  const [summary, setSummary] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#FF5A1F', '#00C49F', '#FFBB28', '#FF8042', '#0088FE', '#AA336A'];

  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  const fetchDashboardSummary = async () => {
    try {
      const summaryRes = await fetch('http://localhost:5000/api/reports/summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (summaryRes.ok) {
        const data = await summaryRes.json();
        if (data.success) {
          setSummary(data.summary);
        }
      }

      const distRes = await fetch('http://localhost:5000/api/reports/distribution', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (distRes.ok) {
        const data = await distRes.json();
        if (data.success) {
          setDistribution(data.distribution || []);
        }
      }

      const trendRes = await fetch('http://localhost:5000/api/reports/collection-trend', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (trendRes.ok) {
        const data = await trendRes.json();
        if (data.success) {
          setTrend(data.trend || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statCard = (icon, title, value, colorClass) => (
    <div className="card p-5 flex items-center justify-between">
      <div>
        <p className="text-xs text-[#A0A0AB] uppercase font-bold tracking-wider">{title}</p>
        <h3 className="text-2xl font-extrabold text-white mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${colorClass}`}>
        {icon}
      </div>
    </div>
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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Administration Dashboard</h1>
          <p className="text-[#A0A0AB] text-sm mt-1">Aggregated platform analytics, loan distributions, and transaction tracking</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/requests" className="btn btn-secondary text-sm border-[#27272A] py-2">
            Inspect Requests
          </Link>
          <Link to="/admin/payments" className="btn btn-primary text-sm py-2">
            Record UPI/Cash Payment
          </Link>
        </div>
      </div>

      {/* Admin Menu Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#27272A] pb-4 mb-8">
        <Link to="/admin" className="px-4 py-2 border-b-2 border-[#FF5A1F] text-white font-bold text-sm">
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
        <Link to="/admin/reports" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
          Reports Panel
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCard(<Users className="text-blue-500" size={20} />, 'Total Customers', summary?.totalCustomers || 0, 'bg-blue-500/10')}
        {statCard(<FileEdit className="text-yellow-500" size={20} />, 'Pending Requests', summary?.pendingRequests || 0, 'bg-yellow-500/10')}
        {statCard(<CheckCircle2 className="text-green-500" size={20} />, 'Active Loans', summary?.activeLoans || 0, 'bg-green-500/10')}
        {statCard(<AlertTriangle className="text-red-500" size={20} />, 'Overdue Accounts', summary?.overdueLoans || 0, 'bg-red-500/10')}
      </div>

      {/* Financial Aggregations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="card p-6 bg-gradient-to-br from-[#141416] to-[#1D1D20]">
          <p className="text-xs text-[#A0A0AB] font-bold uppercase">Total Disbursed Amount</p>
          <h2 className="text-3xl font-extrabold text-white mt-2">₹{summary?.totalDisbursed?.toLocaleString('en-IN') || 0}</h2>
          <p className="text-xs text-[#71717A] mt-2">Paid out to approved loan applicants</p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-[#141416] to-[#1D1D20]">
          <p className="text-xs text-[#A0A0AB] font-bold uppercase">Total Outstanding Balance</p>
          <h2 className="text-3xl font-extrabold text-[#FF5A1F] mt-2">₹{summary?.totalOutstanding?.toLocaleString('en-IN') || 0}</h2>
          <p className="text-xs text-[#71717A] mt-2">Remaining principal and configured interests</p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-[#141416] to-[#1D1D20]">
          <p className="text-xs text-[#A0A0AB] font-bold uppercase">Today's Collections</p>
          <h2 className="text-3xl font-extrabold text-[#10B981] mt-2">₹{summary?.todaysCollection?.toLocaleString('en-IN') || 0}</h2>
          <p className="text-xs text-[#71717A] mt-2">Cash, UPI, and Transfers verified today</p>
        </div>
      </div>

      {/* Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Collection Trend */}
        <div className="card p-6 flex flex-col gap-4">
          <h3 className="text-lg font-bold text-white">Monthly Collection Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#71717A" fontSize={12} />
                <YAxis stroke="#71717A" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#141416', borderColor: '#27272A' }} />
                <Legend />
                <Line type="monotone" dataKey="amount" name="Collections (INR)" stroke="#FF5A1F" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Loan Distribution */}
        <div className="card p-6 flex flex-col gap-4">
          <h3 className="text-lg font-bold text-white">Loan Services Distribution</h3>
          <div className="h-[300px] w-full flex flex-col md:flex-row items-center gap-4">
            <div className="h-full w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="loan_type"
                  >
                    {distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#141416', borderColor: '#27272A' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="flex flex-col gap-2.5 w-full md:w-1/2 text-sm text-[#A0A0AB]">
              {distribution.map((item, index) => (
                <div key={item.loan_type} className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="font-semibold text-white">{item.loan_type}</span>
                  <span className="ml-auto">({item.count} loans)</span>
                </div>
              ))}
              {distribution.length === 0 && (
                <p className="text-xs text-[#71717A]">No loans distributed yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
