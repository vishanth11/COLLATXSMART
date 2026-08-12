import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';
import { Upload, FileText, CheckCircle, AlertCircle, Clock, Trash2, ArrowUpCircle } from 'lucide-react';

export default function Documents() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const [documents, setDocuments] = useState([]);
  const [docType, setDocType] = useState('Identity Proof');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.customerId) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/documents/customer/${user.customerId}`, {
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
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setSuccess('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Max allowed size is 5MB.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('document', file);
    formData.append('document_type', docType);
    formData.append('customer_id', user.customerId);

    try {
      const res = await fetch('http://localhost:5000/api/documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'File upload failed');
      }

      setSuccess('Document uploaded successfully.');
      setFile(null);
      // Reset input element
      document.getElementById('file-input').value = '';
      fetchDocuments();
    } catch (err) {
      setError(err.message || 'File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  // Helper to trigger secure file download from backend
  const handleDownload = async (docId, fileName) => {
    try {
      const res = await fetch(`http://localhost:5000/api/documents/download/${docId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error('Unauthorized to download file.');
      }
      
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
      alert(err.message || 'Download failed.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">{t('documents')}</h1>
        <p className="text-[#A0A0AB] text-sm mt-1">Upload and manage verification credentials (KYC, income slips, collateral deeds)</p>
      </div>

      <div className="flex flex-wrap gap-3 border-b border-[#27272A] pb-4 mb-8">
        <Link to="/customer" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
          {t('dashboard')}
        </Link>
        <Link to="/customer/loan" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
          {t('myLoan')}
        </Link>
        <Link to="/customer/payments" className="px-4 py-2 text-[#A0A0AB] hover:text-white font-semibold text-sm">
          {t('paymentHistory')}
        </Link>
        <Link to="/customer/documents" className="px-4 py-2 border-b-2 border-[#FF5A1F] text-white font-bold text-sm">
          {t('documents')}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form Panel */}
        <div className="card p-6 h-fit flex flex-col gap-5">
          <h3 className="text-xl font-bold text-white border-b border-[#27272A] pb-3">Upload New Credential</h3>
          
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-xs flex items-start gap-2">
              <CheckCircle size={16} className="shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleUpload} className="flex flex-col gap-4">
            <div className="form-group mb-0">
              <label className="form-label">{t('docType')}</label>
              <select 
                className="form-select text-sm"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
              >
                <option value="Identity Proof">Identity Proof (Aadhaar / PAN)</option>
                <option value="Address Proof">Address Proof (Utility Bill / Passport)</option>
                <option value="Income Proof">Income Proof (Salary slips / ITR)</option>
                <option value="Collateral Document">Collateral Document (Gold receipt / RC Book / Deed)</option>
                <option value="Other">Other Supporting Document</option>
              </select>
            </div>

            <div className="form-group mb-0">
              <label className="form-label">Select File (PDF, PNG, JPG - Max 5MB)</label>
              <input 
                type="file" 
                id="file-input"
                className="form-input text-xs pt-2"
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg"
              />
            </div>

            <button 
              type="submit" 
              disabled={uploading || !file}
              className={`btn btn-primary w-full py-2.5 text-sm flex justify-center items-center gap-2 ${
                uploading || !file ? 'btn-disabled' : ''
              }`}
            >
              <Upload size={16} />
              {uploading ? 'Processing Stream...' : t('uploadBtn')}
            </button>
          </form>
        </div>

        {/* Uploaded Documents List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h3 className="text-xl font-bold text-white">Your Uploaded Files</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.length === 0 ? (
              <div className="col-span-2 card text-center py-12 text-[#71717A] text-sm">
                No files uploaded. Submit verification files to support your active application.
              </div>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="p-4 bg-[#141416] border border-[#27272A] rounded-xl flex items-center justify-between group hover:border-[#FF5A1F]/30 transition-all">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2.5 bg-[#1D1D20] rounded-lg text-[#FF5A1F]">
                      <FileText size={20} />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-bold text-white truncate max-w-[150px]">{doc.file_name}</h4>
                      <p className="text-[10px] text-[#A0A0AB]">{doc.document_type} • {(doc.file_size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`badge text-[9px] ${
                      doc.verification_status === 'Verified' ? 'badge-success' :
                      doc.verification_status === 'Rejected' ? 'badge-danger' : 'badge-pending'
                    }`}>
                      {doc.verification_status}
                    </span>
                    <button 
                      onClick={() => handleDownload(doc.id, doc.file_name)}
                      className="text-xs text-[#FF5A1F] hover:underline font-bold"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
