import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export const ForgotPassword: React.FC = () => {
  const { toast, success } = useToast();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsLoading(true);
      const res = await api.post<any>('/auth/forgot-password', { email });
      if (res.success) {
        setSubmitted(true);
        if (res.data?.resetToken) {
          setResetToken(res.data.resetToken);
        }
        success('Password reset instructions dispatched.');
      }
    } catch (err: any) {
      toast(err.message || 'Error requesting reset', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl max-w-md w-full p-8 sm:p-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Forgot Password</h1>
          <p className="text-xs text-slate-500">
            Enter your email to receive recovery instructions.
          </p>
        </div>

        {submitted ? (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-xs font-bold text-emerald-900">Reset Link Dispatched</p>
            <p className="text-xs text-emerald-700">
              Check your inbox for password recovery instructions.
            </p>
            {resetToken && (
              <div className="pt-2 text-[11px] text-slate-600">
                <span className="font-semibold block text-slate-700">Development Demo Token:</span>
                <Link
                  to={`/reset-password?token=${resetToken}`}
                  className="font-mono text-brand-600 underline font-bold"
                >
                  Click here to Reset Password now
                </Link>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Registered Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-brand-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              {isLoading ? 'Sending...' : 'Send Recovery Link'}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
