import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Search, UserCheck } from 'lucide-react';

export default function Customers() {
  const { token } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

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

  const filteredCustomers = customers.filter(c => 
    c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.occupation?.toLowerCase().includes(searchQuery.toLowerCase())
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
        <h1 className="text-3xl font-extrabold text-white">Registered Customers</h1>
        <p className="text-[#A0A0AB] text-sm mt-1">Review profiles, occupations, and linked accounts details</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#27272A] pb-4 mb-8">
        <Link to="/admin" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
          Overview
        </Link>
        <Link to="/admin/requests" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
          Loan Requests
        </Link>
        <Link to="/admin/customers" className="px-4 py-2 border-b-2 border-[#FF5A1F] text-white font-bold text-sm">
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

      {/* Search and Filters */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="form-input pl-10"
            placeholder="Search by name, email, phone, or occupation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid of customer lists */}
      <div className="card">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12 text-[#71717A] text-sm">
            No registered customers match your query.
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Contact Info</th>
                  <th>Occupation</th>
                  <th>Monthly Income</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c) => (
                  <tr key={c.id}>
                    <td className="font-bold text-white">CUST-{c.id.toString().padStart(6, '0')}</td>
                    <td className="font-bold text-[#FF5A1F]">{c.full_name}</td>
                    <td>
                      <div className="flex flex-col text-xs">
                        <span className="text-white font-semibold">{c.phone}</span>
                        <span className="text-[#71717A]">{c.email}</span>
                      </div>
                    </td>
                    <td>{c.occupation}</td>
                    <td>₹{c.monthly_income?.toLocaleString('en-IN')}</td>
                    <td className="max-w-xs truncate text-[#A0A0AB]">{c.address}</td>
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
