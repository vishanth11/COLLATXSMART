import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle, XCircle, Download } from 'lucide-react';

export default function Documents() {
  const { token } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/documents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setDocuments(data.documents || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, status) => {
    setProcessingId(id);
    try {
      const res = await fetch(`http://localhost:5000/api/documents/${id}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ verification_status: status })
      });
      if (res.ok) {
        fetchDocuments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDownload = async (docId, fileName) => {
    try {
      const res = await fetch(`http://localhost:5000/api/documents/download/${docId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error downloading document.');
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
        <h1 className="text-3xl font-extrabold text-white">Documents Auditor</h1>
        <p className="text-[#A0A0AB] text-sm mt-1">Review applicant identity records, income statements, and property deeds</p>
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
        <Link to="/admin/documents" className="px-4 py-2 border-b-2 border-[#FF5A1F] text-white font-bold text-sm">
          Documents Audit
        </Link>
        <Link to="/admin/reports" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
          Reports Panel
        </Link>
      </div>

      <div className="card">
        {documents.length === 0 ? (
          <div className="text-center py-12 text-[#71717A] text-sm">
            No uploaded documents require verification.
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Doc ID</th>
                  <th>Client</th>
                  <th>Document Category</th>
                  <th>File Name</th>
                  <th>File Size</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td className="font-bold text-white">DOC-{doc.id.toString().padStart(6, '0')}</td>
                    <td className="font-bold text-white">{doc.full_name}</td>
                    <td>{doc.document_type}</td>
                    <td className="text-white font-mono text-xs">{doc.file_name}</td>
                    <td>{(doc.file_size / 1024).toFixed(1)} KB</td>
                    <td>
                      <span className={`badge ${
                        doc.verification_status === 'Verified' ? 'badge-success' :
                        doc.verification_status === 'Rejected' ? 'badge-danger' : 'badge-pending'
                      }`}>
                        {doc.verification_status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownload(doc.id, doc.file_name)}
                          className="btn btn-secondary py-1 px-2.5 text-[10px] border-[#27272A] flex items-center gap-1"
                        >
                          <Download size={10} /> Download
                        </button>
                        {doc.verification_status === 'Pending' && (
                          <>
                            <button
                              disabled={processingId === doc.id}
                              onClick={() => handleVerify(doc.id, 'Verified')}
                              className="btn btn-primary py-1 px-2.5 text-[10px] flex items-center gap-1"
                            >
                              <CheckCircle size={10} /> Approve
                            </button>
                            <button
                              disabled={processingId === doc.id}
                              onClick={() => handleVerify(doc.id, 'Rejected')}
                              className="btn btn-secondary py-1 px-2.5 text-[10px] border-red-500/20 text-red-500 hover:bg-red-500/10"
                            >
                              <XCircle size={10} /> Reject
                            </button>
                          </>
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
