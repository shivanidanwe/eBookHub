import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PenTool, User, Mail, Lock, Phone, FileText, CheckCircle2, Award } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const RegisterAuthor: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast, success, error } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [bio, setBio] = useState('');
  const [expertise, setExpertise] = useState('Computer Science, AI & Machine Learning');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !bio || !password) {
      toast('Please fill in all required fields.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      toast('Passwords do not match.', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.post<any>('/auth/register/author', {
        fullName,
        email,
        mobile,
        bio,
        expertise,
        password,
      });

      if (res.success && res.data) {
        login(res.data.token, res.data.user);
        success('Author application submitted! It has been submitted for administrative review.');
        navigate('/author/approval-status');
      }
    } catch (err: any) {
      error(err.message || 'Application submission failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl max-w-lg w-full p-8 sm:p-10 space-y-6">
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-author-600 text-white flex items-center justify-center mx-auto shadow-md">
            <PenTool className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Author Application
          </h1>
          <p className="text-xs text-slate-500">
            Apply to publish and sell educational eBooks on eBookHub India.
          </p>
        </div>

        {/* Benefits badge */}
        <div className="bg-author-50 p-4 rounded-2xl border border-author-200 text-xs text-author-800 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <Award className="w-4 h-4 text-author-600" />
            Author Partnership Terms:
          </p>
          <p className="text-[11px] leading-relaxed">
            • Retain 85% net earnings on every sale.<br />
            • Transparent ledger tracking and automated bank/UPI payouts.<br />
            • Fast application review turnaround (usually within 24-48 hours).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Full Legal Name *</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Prof. / Dr. / Er. Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-author-500"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Email Address *</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="author@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-author-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Mobile Number *</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="+91 98201 12345"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-author-500"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Areas of Expertise *</label>
            <input
              type="text"
              required
              placeholder="e.g. Computer Science, Python, UPSC Polity, GATE"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-author-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Professional Bio / Academic Background *</label>
            <textarea
              rows={3}
              required
              placeholder="Tell us about your teaching experience, degrees, or books you plan to publish..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-author-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Password *</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Min 6 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-author-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Confirm Password *</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Re-enter"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-author-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 text-xs">
            <input
              type="checkbox"
              id="agreeAuthor"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="rounded text-author-600 focus:ring-author-500"
            />
            <label htmlFor="agreeAuthor" className="text-slate-600 text-[11px]">
              I declare that I hold copyright ownership over materials submitted and accept the 15% platform commission terms.
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-author-600 hover:bg-author-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            {isLoading ? 'Submitting Application...' : 'Submit Author Application'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Already an approved author?{' '}
          <Link to="/login" className="font-bold text-author-600 hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
