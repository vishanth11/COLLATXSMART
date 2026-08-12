import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  User, Clipboard, ShieldCheck, FileCheck, CheckCircle2, 
  ArrowLeft, ArrowRight, Upload, AlertCircle 
} from 'lucide-react';

export default function Apply() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [applicationId, setApplicationId] = useState('');

  // CENTRAL FORM STATE
  const [formData, setFormData] = useState({
    // Step 1: Personal
    fullName: '',
    phone: '',
    email: '',
    address: '',
    occupation: '',
    monthlyIncome: '',
    password: '', // Needed to auto-create user account if not logged in
    
    // Step 2: Loan
    loanType: 'Personal',
    requestedAmount: '',
    purpose: '',
    repaymentFrequency: 'Monthly',
    requestedDurationMonths: '12',
    
    // Step 3: Collateral
    hasCollateral: 'no',
    collateralType: 'Gold',
    goldWeight: '',
    goldPurity: '',
    vehicleModel: '',
    vehicleRegNo: '',
    propertyArea: '',
    gadgetModel: '',
    gadgetSerial: '',
    otherCollateralDetails: '',
    collateralValue: '',
  });

  // Step 4: Documents (Binary state)
  const [files, setFiles] = useState({
    identityProof: null,
    addressProof: null,
    incomeProof: null,
    collateralDoc: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, key) => {
    setFiles(prev => ({ ...prev, [key]: e.target.files[0] }));
  };

  const nextStep = () => {
    setError('');
    // Validation for Step 1
    if (step === 1) {
      if (!formData.fullName || !formData.phone || !formData.email || !formData.address || !formData.occupation || !formData.monthlyIncome) {
        setError('Please fill in all required personal information.');
        return;
      }
      if (!token && !formData.password) {
        setError('Please enter a password to register your account.');
        return;
      }
    }
    // Validation for Step 2
    if (step === 2) {
      if (!formData.requestedAmount || !formData.purpose || !formData.requestedDurationMonths) {
        setError('Please specify your loan request details.');
        return;
      }
    }
    // Validation for Step 3
    if (step === 3 && formData.hasCollateral === 'yes') {
      if (!formData.collateralValue) {
        setError('Please estimate the collateral asset value.');
        return;
      }
    }

    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Submit Loan Application JSON
      const payload = {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        occupation: formData.occupation,
        monthlyIncome: parseFloat(formData.monthlyIncome),
        password: formData.password,
        
        loanType: formData.loanType,
        requestedAmount: parseFloat(formData.requestedAmount),
        purpose: formData.purpose,
        repaymentFrequency: formData.repaymentFrequency,
        requestedDurationMonths: parseInt(formData.requestedDurationMonths),
        
        hasCollateral: formData.hasCollateral === 'yes' ? 1 : 0,
        collateralType: formData.collateralType,
        collateralValue: formData.collateralValue ? parseFloat(formData.collateralValue) : 0,
        
        // Bundle dynamic collateral parameters into single string
        collateralDetails: JSON.stringify({
          goldWeight: formData.goldWeight,
          goldPurity: formData.goldPurity,
          vehicleModel: formData.vehicleModel,
          vehicleRegNo: formData.vehicleRegNo,
          propertyArea: formData.propertyArea,
          gadgetModel: formData.gadgetModel,
          gadgetSerial: formData.gadgetSerial,
          otherDetails: formData.otherCollateralDetails
        })
      };

      const res = await fetch('http://localhost:5000/api/loan-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit loan application.');
      }

      const newAppId = data.applicationId;
      const customerId = data.customerId;
      const userToken = data.token || token; // If register was called backend returns user token

      // 2. Stream Binary Files (Identity, Address, Income, Collateral)
      for (const [key, file] of Object.entries(files)) {
        if (file) {
          const docTypeMap = {
            identityProof: 'Identity Proof',
            addressProof: 'Address Proof',
            incomeProof: 'Income Proof',
            collateralDoc: 'Collateral Document'
          };

          const fileData = new FormData();
          fileData.append('document', file);
          fileData.append('document_type', docTypeMap[key]);
          fileData.append('customer_id', customerId);
          fileData.append('loan_id', ''); // Linked during application review or loan active creation

          await fetch('http://localhost:5000/api/documents', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${userToken}`
            },
            body: fileData
          });
        }
      }

      setApplicationId(newAppId);
      setStep(5);
    } catch (err) {
      setError(err.message || 'Failed to process application. Email/Phone may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 relative min-h-[80vh] flex flex-col justify-center items-center">
      {/* Background decoration */}
      <div className="absolute top-[10%] left-[-15%] w-[40vw] h-[40vw] bg-[#FF5A1F] rounded-full filter blur-[150px] opacity-[0.03] pointer-events-none"></div>

      <div className="max-w-2xl w-full bg-[#141416] border border-[#27272A] rounded-2xl p-8 relative z-10 shadow-2xl">
        
        {/* PROGRESS STEP BAR */}
        {step < 5 && (
          <div className="flex justify-between items-center mb-8 border-b border-[#27272A] pb-6">
            {[
              { num: 1, label: t('personalInfo'), icon: <User size={16} /> },
              { num: 2, label: t('loanReq'), icon: <Clipboard size={16} /> },
              { num: 3, label: t('collateral'), icon: <ShieldCheck size={16} /> },
              { num: 4, label: t('docUpload'), icon: <FileCheck size={16} /> }
            ].map((s) => (
              <div key={s.num} className="flex flex-col items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${
                  step === s.num 
                    ? 'bg-[#FF5A1F] border-[#FF5A1F] text-white shadow-lg' 
                    : step > s.num
                      ? 'bg-[#1D1D20] border-[#1D1D20] text-[#10B981]'
                      : 'bg-transparent border-[#27272A] text-[#71717A]'
                }`}>
                  {step > s.num ? <CheckCircle2 size={16} /> : s.num}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider text-center hidden md:inline ${
                  step === s.num ? 'text-white' : 'text-[#71717A]'
                }`}>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs flex items-center gap-2 mb-6">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: PERSONAL INFORMATION */}
        {step === 1 && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-white mb-2">{t('personalInfo')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group mb-0">
                <label className="form-label">{t('fullName')}</label>
                <input 
                  type="text" name="fullName" required className="form-input" 
                  value={formData.fullName} onChange={handleChange} 
                />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">{t('mobileNumber')}</label>
                <input 
                  type="tel" name="phone" required className="form-input" 
                  value={formData.phone} onChange={handleChange} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group mb-0">
                <label className="form-label">{t('emailAddr')}</label>
                <input 
                  type="email" name="email" required className="form-input" 
                  value={formData.email} onChange={handleChange} 
                />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">{t('occupation')}</label>
                <input 
                  type="text" name="occupation" required className="form-input" 
                  placeholder="e.g. Software Engineer, Farmer"
                  value={formData.occupation} onChange={handleChange} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group mb-0">
                <label className="form-label">{t('monthlyIncome')}</label>
                <input 
                  type="number" name="monthlyIncome" required className="form-input" 
                  value={formData.monthlyIncome} onChange={handleChange} 
                />
              </div>
              {!token && (
                <div className="form-group mb-0">
                  <label className="form-label">Password (For Portal Login Setup)</label>
                  <input 
                    type="password" name="password" required className="form-input" 
                    placeholder="Create a password"
                    value={formData.password} onChange={handleChange} 
                  />
                </div>
              )}
            </div>

            <div className="form-group mb-0">
              <label className="form-label">{t('address')}</label>
              <textarea 
                name="address" rows={2} required className="form-textarea" 
                value={formData.address} onChange={handleChange} 
              />
            </div>

            <button onClick={nextStep} className="btn btn-primary ml-auto py-2.5 px-6 mt-4">
              {t('nextBtn')} <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* STEP 2: LOAN REQUIREMENTS */}
        {step === 2 && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-white mb-2">{t('loanReq')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group mb-0">
                <label className="form-label">{t('loanType')}</label>
                <select name="loanType" className="form-select" value={formData.loanType} onChange={handleChange}>
                  <option value="Personal">{t('personalLoan')}</option>
                  <option value="Home">{t('homeLoan')}</option>
                  <option value="Bike">{t('bikeLoan')}</option>
                  <option value="Car">{t('carLoan')}</option>
                  <option value="Emergency">{t('emergencyLoan')}</option>
                  <option value="Business">{t('businessLoan')}</option>
                </select>
              </div>

              <div className="form-group mb-0">
                <label className="form-label">{t('reqAmount')}</label>
                <input 
                  type="number" name="requestedAmount" required className="form-input" 
                  value={formData.requestedAmount} onChange={handleChange} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group mb-0">
                <label className="form-label">{t('repayFreq')}</label>
                <select name="repaymentFrequency" className="form-select" value={formData.repaymentFrequency} onChange={handleChange}>
                  <option value="Monthly">Monthly</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Daily">Daily</option>
                </select>
              </div>

              <div className="form-group mb-0">
                <label className="form-label">{t('prefDuration')}</label>
                <input 
                  type="number" name="requestedDurationMonths" required className="form-input" 
                  value={formData.requestedDurationMonths} onChange={handleChange} 
                />
              </div>
            </div>

            <div className="form-group mb-0">
              <label className="form-label">{t('purpose')}</label>
              <textarea 
                name="purpose" rows={2} required className="form-textarea" 
                placeholder="Brief description of how the funds will be used..."
                value={formData.purpose} onChange={handleChange} 
              />
            </div>

            <div className="flex justify-between mt-4">
              <button onClick={prevStep} className="btn btn-secondary py-2.5 px-6 border-[#27272A]">
                <ArrowLeft size={16} /> {t('prevBtn')}
              </button>
              <button onClick={nextStep} className="btn btn-primary py-2.5 px-6">
                {t('nextBtn')} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: COLLATERAL */}
        {step === 3 && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-white mb-2">{t('collateral')}</h3>

            <div className="form-group mb-0">
              <label className="form-label">{t('hasCollateral')}</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-white font-semibold cursor-pointer">
                  <input 
                    type="radio" name="hasCollateral" value="yes" 
                    checked={formData.hasCollateral === 'yes'} onChange={handleChange} 
                  /> Yes
                </label>
                <label className="flex items-center gap-2 text-sm text-white font-semibold cursor-pointer">
                  <input 
                    type="radio" name="hasCollateral" value="no" 
                    checked={formData.hasCollateral === 'no'} onChange={handleChange} 
                  /> No (Proceed to verification)
                </label>
              </div>
            </div>

            {formData.hasCollateral === 'yes' && (
              <div className="border-t border-[#27272A] pt-4 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group mb-0">
                    <label className="form-label">{t('collateralType')}</label>
                    <select name="collateralType" className="form-select" value={formData.collateralType} onChange={handleChange}>
                      <option value="Gold">Gold</option>
                      <option value="Silver">Silver</option>
                      <option value="Bike Documents">Bike Documents</option>
                      <option value="Car Documents">Car Documents</option>
                      <option value="Home/Property Documents">Home/Property Documents</option>
                      <option value="Mobile">Mobile Phone</option>
                      <option value="Laptop">Laptop</option>
                      <option value="Other">Other Approved Assets</option>
                    </select>
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label">{t('collateralEstVal')}</label>
                    <input 
                      type="number" name="collateralValue" required className="form-input" 
                      value={formData.collateralValue} onChange={handleChange} 
                    />
                  </div>
                </div>

                {/* CONDITIONAL SUBFIELDS */}
                {formData.collateralType === 'Gold' && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-200">
                    <div className="form-group mb-0">
                      <label className="form-label text-xs">Gold Weight (Grams)</label>
                      <input type="number" name="goldWeight" className="form-input text-sm" value={formData.goldWeight} onChange={handleChange} />
                    </div>
                    <div className="form-group mb-0">
                      <label className="form-label text-xs">Purity (Karat, e.g. 22K)</label>
                      <input type="text" name="goldPurity" className="form-input text-sm" placeholder="22K or 24K" value={formData.goldPurity} onChange={handleChange} />
                    </div>
                  </div>
                )}

                {(formData.collateralType === 'Bike Documents' || formData.collateralType === 'Car Documents') && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-200">
                    <div className="form-group mb-0">
                      <label className="form-label text-xs">Vehicle Model / Year</label>
                      <input type="text" name="vehicleModel" className="form-input text-sm" placeholder="e.g. Bajaj Pulsar 2022" value={formData.vehicleModel} onChange={handleChange} />
                    </div>
                    <div className="form-group mb-0">
                      <label className="form-label text-xs">Registration Number</label>
                      <input type="text" name="vehicleRegNo" className="form-input text-sm" placeholder="e.g. TN-37-AA-1234" value={formData.vehicleRegNo} onChange={handleChange} />
                    </div>
                  </div>
                )}

                {formData.collateralType === 'Home/Property Documents' && (
                  <div className="form-group mb-0 animate-in fade-in duration-200">
                    <label className="form-label text-xs">Property Survey No. & Area Sqft</label>
                    <input type="text" name="propertyArea" className="form-input text-sm" placeholder="e.g. Survey #104/2A, 1200 Sqft, Peelamedu" value={formData.propertyArea} onChange={handleChange} />
                  </div>
                )}

                {(formData.collateralType === 'Mobile' || formData.collateralType === 'Laptop') && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-200">
                    <div className="form-group mb-0">
                      <label className="form-label text-xs">Gadget Brand & Model</label>
                      <input type="text" name="gadgetModel" className="form-input text-sm" placeholder="e.g. iPhone 15 / MacBook Air M2" value={formData.gadgetModel} onChange={handleChange} />
                    </div>
                    <div className="form-group mb-0">
                      <label className="form-label text-xs">Serial No. / IMEI</label>
                      <input type="text" name="gadgetSerial" className="form-input text-sm" value={formData.gadgetSerial} onChange={handleChange} />
                    </div>
                  </div>
                )}

                {formData.collateralType === 'Other' && (
                  <div className="form-group mb-0 animate-in fade-in duration-200">
                    <label className="form-label text-xs">Pledged Asset Details</label>
                    <textarea name="otherCollateralDetails" rows={2} className="form-textarea text-sm" placeholder="Describe the item in detail..." value={formData.otherCollateralDetails} onChange={handleChange} />
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between mt-4">
              <button onClick={prevStep} className="btn btn-secondary py-2.5 px-6 border-[#27272A]">
                <ArrowLeft size={16} /> {t('prevBtn')}
              </button>
              <button onClick={nextStep} className="btn btn-primary py-2.5 px-6">
                {t('nextBtn')} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: DOCUMENT UPLOAD */}
        {step === 4 && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-white mb-2">{t('docUpload')}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-[#1D1D20] border border-[#27272A] rounded-xl flex flex-col gap-2">
                <span className="text-xs font-bold text-white">Identity Proof (Aadhaar/PAN)</span>
                <input 
                  type="file" accept=".pdf,.png,.jpg,.jpeg" className="form-input text-xs pt-1.5"
                  onChange={(e) => handleFileChange(e, 'identityProof')} 
                />
                {files.identityProof && <span className="text-[10px] text-green-500 font-bold">Selected: {files.identityProof.name}</span>}
              </div>

              <div className="p-4 bg-[#1D1D20] border border-[#27272A] rounded-xl flex flex-col gap-2">
                <span className="text-xs font-bold text-white">Address Proof (Utility Bill/Passport)</span>
                <input 
                  type="file" accept=".pdf,.png,.jpg,.jpeg" className="form-input text-xs pt-1.5"
                  onChange={(e) => handleFileChange(e, 'addressProof')} 
                />
                {files.addressProof && <span className="text-[10px] text-green-500 font-bold">Selected: {files.addressProof.name}</span>}
              </div>

              <div className="p-4 bg-[#1D1D20] border border-[#27272A] rounded-xl flex flex-col gap-2">
                <span className="text-xs font-bold text-white">Income Proof (Pay Slip/Bank Statement)</span>
                <input 
                  type="file" accept=".pdf,.png,.jpg,.jpeg" className="form-input text-xs pt-1.5"
                  onChange={(e) => handleFileChange(e, 'incomeProof')} 
                />
                {files.incomeProof && <span className="text-[10px] text-green-500 font-bold">Selected: {files.incomeProof.name}</span>}
              </div>

              {formData.hasCollateral === 'yes' && (
                <div className="p-4 bg-[#1D1D20] border border-[#27272A] rounded-xl flex flex-col gap-2">
                  <span className="text-xs font-bold text-white">Collateral Document (Invoice/RC book)</span>
                  <input 
                    type="file" accept=".pdf,.png,.jpg,.jpeg" className="form-input text-xs pt-1.5"
                    onChange={(e) => handleFileChange(e, 'collateralDoc')} 
                  />
                  {files.collateralDoc && <span className="text-[10px] text-green-500 font-bold">Selected: {files.collateralDoc.name}</span>}
                </div>
              )}
            </div>

            <div className="p-4 bg-[#FF5A1F]/5 border border-[#FF5A1F]/10 rounded-xl text-xs text-[#A0A0AB]">
              <p className="font-bold text-white mb-1">Verify details before submission:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Double check monthly income matching your income slip.</li>
                <li>Make sure file sizes do not exceed 5MB.</li>
              </ul>
            </div>

            <div className="flex justify-between mt-4">
              <button onClick={prevStep} className="btn btn-secondary py-2.5 px-6 border-[#27272A]" disabled={loading}>
                <ArrowLeft size={16} /> {t('prevBtn')}
              </button>
              <button onClick={handleSubmit} disabled={loading} className={`btn btn-primary py-2.5 px-8 ${loading ? 'btn-disabled' : ''}`}>
                {loading ? 'Submitting Forms...' : t('submitBtn')}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: SUCCESS / APPLICATION ID DISPLAY */}
        {step === 5 && (
          <div className="flex flex-col items-center gap-6 text-center py-10 animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 text-green-500 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-white">Application Submitted!</h2>
              <p className="text-sm text-[#A0A0AB] mt-2 max-w-sm">
                Your loan request has been successfully registered. Note your application ID for verification queries.
              </p>
            </div>

            <div className="p-5 bg-[#1D1D20] border border-[#27272A] rounded-xl flex flex-col gap-1 w-full max-w-xs font-mono">
              <span className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider">APPLICATION ID</span>
              <span className="text-xl font-bold text-white">{applicationId}</span>
            </div>

            <div className="flex gap-4 border-t border-[#27272A] pt-6 w-full mt-4 justify-center">
              <Link to="/login" className="btn btn-primary text-sm py-2">
                Go to Portal Login
              </Link>
              <Link to="/" className="btn btn-secondary text-sm py-2 border-[#27272A]">
                Back Home
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
