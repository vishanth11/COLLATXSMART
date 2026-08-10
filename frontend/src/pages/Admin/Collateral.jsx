import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Search, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function Collateral() {
  const { token } = useAuth();
  const [collaterals, setCollaterals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchCollaterals();
  }, []);

  const fetchCollaterals = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/collateral', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCollaterals(data.collaterals || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, field, value) => {
    setProcessingId(id);
    try {
      const res = await fetch(`http://localhost:5000/api/collateral/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ [field]: value })
      });
      if (res.ok) {
        fetchCollaterals();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
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
        <h1 className="text-3xl font-extrabold text-white">Collateral Assets Registry</h1>
        <p className="text-[#A0A0AB] text-sm mt-1">Audit valuations and verify physical or document holdings</p>
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
        <Link to="/admin/collateral" className="px-4 py-2 border-b-2 border-[#FF5A1F] text-white font-bold text-sm">
          Collateral
        </Link>
        <Link to="/admin/documents" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
          Documents Audit
        </Link>
        <Link to="/admin/reports" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
          Reports Panel
        </Link>
      </div>

      <div className="card">
        {collaterals.length === 0 ? (
          <div className="text-center py-12 text-[#71717A] text-sm">
            No collateral assets registered in database.
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Asset ID</th>
                  <th>Client</th>
                  <th>Type</th>
                  <th>Est. Value</th>
                  <th>Description</th>
                  <th>Holding Status</th>
                  <th>Release Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {collaterals.map((c) => (
                  <tr key={c.id}>
                    <td className="font-bold text-white">COL-{c.id.toString().padStart(6, '0')}</td>
                    <td className="font-bold text-white">{c.full_name}</td>
                    <td>{c.type}</td>
                    <td className="font-semibold text-[#FF5A1F]">₹{c.estimated_value?.toLocaleString('en-IN')}</td>
                    <td className="text-xs max-w-xs truncate text-[#A0A0AB]">{c.description}</td>
                    <td>
                      <span className={`badge ${
                        c.verification_status === 'Verified' ? 'badge-success' :
                        c.verification_status === 'Rejected' ? 'badge-danger' : 'badge-pending'
                      }`}>
                        {c.verification_status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        c.release_status === 'Released' ? 'badge-success' : 'badge-info'
                      }`}>
                        {c.release_status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {c.verification_status === 'Pending' && (
                          <button
                            disabled={processingId === c.id}
                            onClick={() => handleUpdateStatus(c.id, 'verification_status', 'Verified')}
                            className="btn btn-primary py-1 px-2.5 text-[10px]"
                          >
                            Verify
                          </button>
                        )}
                        {c.release_status === 'Held' && c.verification_status === 'Verified' && (
                          <button
                            disabled={processingId === c.id}
                            onClick={() => handleUpdateStatus(c.id, 'release_status', 'Released')}
                            className="btn btn-secondary py-1 px-2.5 text-[10px] border-[#27272A]"
                          >
                            Release
                          </button>
                        )}
                      </div>
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
