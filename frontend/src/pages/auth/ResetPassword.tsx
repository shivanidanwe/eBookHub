import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { toast, success, error } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast('Reset token is missing from URL.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast('Passwords do not match.', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.post<any>('/auth/reset-password', {
        token,
        newPassword,
      });
      if (res.success) {
        success('Password updated successfully! Please login with your new password.');
        navigate('/login');
      }
    } catch (err: any) {
      error(err.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl max-w-md w-full p-8 sm:p-10 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Set New Password</h1>
          <p className="text-xs text-slate-500">Choose a secure password for your eBookHub account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">New Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-brand-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Confirm New Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-brand-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <Link to="/login" className="text-xs font-bold text-brand-600 hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
