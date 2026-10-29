import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast, success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await api.post<any>('/auth/login', { email, password });
      if (res.success && res.data) {
        if (res.data.user.role !== 'ADMIN') {
          toast('Access denied. Administrator privileges required.', 'error');
          return;
        }
        login(res.data.token, res.data.user);
        success('Administrator authenticated.');
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      error(err.message || 'Invalid administrator credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-md w-full p-8 sm:p-10 space-y-6">
        {/* Header (Matching Screen 1 of Administrator Interface) */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-admin-600 text-white flex items-center justify-center mx-auto shadow-md shadow-admin-600/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            eBook<span className="text-admin-600">Hub</span> Admin
          </h1>
          <p className="text-xs text-slate-500">
            Platform governance and administrative control console.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Admin Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-admin-500 transition"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Master Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-admin-500 transition"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-admin-600 hover:bg-admin-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            {isLoading ? 'Verifying...' : 'Authenticate to Admin Console'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs">
          <Link to="/" className="text-slate-500 hover:text-slate-800 font-semibold">
            &larr; Return to Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
};
