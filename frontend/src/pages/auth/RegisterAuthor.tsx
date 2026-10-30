import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PenTool, User, Mail, Lock, Eye, EyeOff, Award, BookOpen } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const RegisterAuthor: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [expertise, setExpertise] = useState('');
  const [bio, setBio] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      error('Full Name is required.');
      return;
    }
    if (!email.trim()) {
      error('Email Address is required.');
      return;
    }
    if (!password || password.length < 6) {
      error('Password must be at least 6 characters.');
      return;
    }
    if (!expertise.trim()) {
      error('Please specify your areas of expertise.');
      return;
    }
    if (!bio.trim()) {
      error('Please provide a short biography.');
      return;
    }
    if (!agreeTerms) {
      error('Please accept the Author Agreement terms.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.post<any>('/auth/register/author', {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        expertise: expertise.trim(),
        bio: bio.trim(),
      });

      if (res.success && res.data) {
        login(res.data.token, res.data.user);
        success('Author application submitted! It has been routed to administration review.');
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
          <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center mx-auto shadow-md shadow-orange-500/20">
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
        <div className="bg-orange-50/70 p-4 rounded-2xl border border-orange-200 text-xs text-orange-950 space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-orange-800">
            <Award className="w-4 h-4 text-orange-600" />
            <span>Author Terms & Royalties:</span>
          </p>
          <p className="text-[11px] text-orange-900 leading-relaxed">
            • Retain <strong>85% net direct royalties</strong> on every student purchase.<br />
            • Transparent ledger tracking and automated bank/UPI settlements.<br />
            • Fast administrative review turnaround.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Full Name</span>
              <span className="text-rose-500 text-[11px]">* Required</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Prof. / Dr. / Er. Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-orange-500 transition"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Email Address</span>
              <span className="text-rose-500 text-[11px]">* Required</span>
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="author@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-orange-500 transition"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Password</span>
              <span className="text-rose-500 text-[11px]">* Min 6 chars</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Create author password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-orange-500 transition"
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

          {/* Expertise */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Expertise</span>
              <span className="text-rose-500 text-[11px]">* Required</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Computer Science, AI, UPSC Polity, GATE Preparation"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          {/* Short Biography */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Short Biography</span>
              <span className="text-rose-500 text-[11px]">* Required</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="Brief summary of your academic background, teaching experience, and authored notes..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          {/* Accept Terms */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded text-orange-600 focus:ring-orange-500"
              />
              <span className="leading-relaxed">
                I accept the <Link to="/terms" className="text-orange-600 hover:underline font-semibold">Author Publishing Agreement</Link> and certify original copyright ownership.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            {isLoading ? 'Submitting Application...' : 'Submit Author Application'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Already an approved author?{' '}
          <Link to="/login" className="text-orange-600 font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
