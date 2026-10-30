import React, { useState, useEffect } from 'react';
import { Save, Building2, User, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export const AuthorSettings: React.FC = () => {
  const { success, error } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [bio, setBio] = useState('');
  const [expertise, setExpertise] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        const res = await api.get<any>('/author/profile');
        if (res.success && res.data) {
          const p = res.data;
          setProfile(p);
          setFullName(p.fullName || '');
          setMobile(p.mobile || '');
          setBio(p.bio || '');
          setExpertise(Array.isArray(p.expertise) ? p.expertise.join(', ') : p.expertise || '');
          setBankName(p.bankName || '');
          setAccountNumber(p.accountNumber || '');
          setIfscCode(p.ifscCode || '');
          setUpiId(p.upiId || '');
          setPanNumber(p.panNumber || '');
          setGstNumber(p.gstNumber || '');
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await api.put<any>('/author/profile', {
        fullName,
        mobile,
        bio,
        expertise: expertise.split(',').map((s) => s.trim()).filter(Boolean),
        bankName,
        accountNumber,
        ifscCode: ifscCode.toUpperCase().trim(),
        upiId: upiId.trim(),
        panNumber: panNumber.toUpperCase().trim(),
        gstNumber: gstNumber.toUpperCase().trim(),
      });

      if (res.success) {
        success('Author profile and payout settings saved successfully.');
      }
    } catch (err: any) {
      error(err.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Author Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure banking payout destination, public biography, and academic credentials.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-orange-600" />
            <span>Public Identity & Credentials</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Author Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Contact Mobile</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Areas of Expertise (comma-separated)</label>
            <input
              type="text"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              placeholder="e.g. Computer Science, AI, Python, GATE"
              className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Academic & Professional Biography</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Summary of teaching experience, publications, or industry background..."
              className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Banking & Settlement Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-orange-600" />
            <span>Bank & Payout Settlement Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Bank Name</label>
              <input
                type="text"
                placeholder="e.g. State Bank of India, HDFC Bank"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Bank Account Number</label>
              <input
                type="text"
                placeholder="e.g. 50100234567890"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">IFSC Code</label>
              <input
                type="text"
                placeholder="e.g. SBIN0001234"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-orange-500 font-mono uppercase"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">UPI ID (Alternative Settlement)</label>
              <input
                type="text"
                placeholder="username@okhdfcbank"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Tax Information */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-orange-600" />
            <span>Tax & Legal Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">PAN Card Number</label>
              <input
                type="text"
                placeholder="ABCDE1234F"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-orange-500 font-mono uppercase"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">GSTIN (Optional)</label>
              <input
                type="text"
                placeholder="27ABCDE1234F1Z5"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-orange-500 font-mono uppercase"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
