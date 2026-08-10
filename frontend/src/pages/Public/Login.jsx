import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { KeyRound, Mail, AlertTriangle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/customer');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background decoration */}
      <div className="absolute top-[20%] left-[20%] w-[30vw] h-[30vw] bg-[#FF5A1F] rounded-full filter blur-[150px] opacity-[0.05] pointer-events-none"></div>
      
      <div className="max-w-md w-full space-y-8 bg-[#141416] p-8 border border-[#27272A] rounded-2xl relative z-10 shadow-2xl">
        <div className="text-center">
          <span className="text-2xl font-extrabold tracking-wider text-white">
            COLLATX<span className="text-[#FF5A1F]">SMART</span>
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-white">
            Portal Access
          </h2>
          <p className="mt-2 text-sm text-[#A0A0AB]">
            Secure login for customers and administration
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-500 text-sm">
            <AlertTriangle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="form-input pl-10"
                  placeholder="admin@collatxsmart.com or arun@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <KeyRound size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="form-input pl-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`btn btn-primary w-full py-3 text-base flex justify-center items-center gap-2 ${
                loading ? 'btn-disabled' : ''
              }`}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-[#71717A] border-t border-[#27272A] pt-4 mt-6">
          <p>Demo Credentials:</p>
          <p className="mt-1">Admin: <strong className="text-white">admin@collatxsmart.com</strong> / password123</p>
          <p>Customer: <strong className="text-white">arun@example.com</strong> / password123</p>
        </div>
      </div>
    </div>
  );
}
