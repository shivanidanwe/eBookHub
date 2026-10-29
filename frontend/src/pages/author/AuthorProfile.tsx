import React, { useState, useEffect } from 'react';
import { User, Building, Receipt, Lock, Save, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AuthorProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { toast, success } = useToast();

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
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadAuthorProfile() {
      try {
        const res = await api.get<any>('/author/profile');
        if (res.success && res.data) {
          setFullName(res.data.fullName || user?.fullName || '');
          setMobile(res.data.mobile || '');
          setBio(res.data.bio || '');
          setExpertise(Array.isArray(res.data.expertise) ? res.data.expertise.join(', ') : '');
          setBankName(res.data.bankName || '');
          setAccountNumber(res.data.accountNumber || '');
          setIfscCode(res.data.ifscCode || '');
          setUpiId(res.data.upiId || '');
          setPanNumber(res.data.panNumber || '');
          setGstNumber(res.data.gstNumber || '');
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadAuthorProfile();
  }, [user]);

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
        ifscCode,
        upiId,
        panNumber,
        gstNumber,
      });

      if (res.success) {
        success('Author profile, bank, and tax details saved.');
        await refreshUser();
      }
    } catch (err: any) {
      toast(err.message || 'Could not save profile details', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Author Profile & Payout Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Maintain your public educator identity, payout bank account, and tax information.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Public Educator Bio (Matching Screen 9 of Mockup) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <User className="w-5 h-5 text-author-600" />
            <h2 className="text-base font-bold text-slate-900">Personal & Academic Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Author Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-author-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Mobile Number</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-author-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Areas of Expertise</label>
            <input
              type="text"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-author-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Public Biography</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-author-500"
            />
          </div>
        </div>

        {/* 2. Bank Details for Payouts (Matching Screen 9 of Mockup) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Building className="w-5 h-5 text-author-600" />
            <h2 className="text-base font-bold text-slate-900">Bank Details for Payout Settlements</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Bank Name</label>
              <input
                type="text"
                placeholder="e.g. HDFC Bank, State Bank of India"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-author-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Account Number</label>
              <input
                type="text"
                placeholder="Account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-author-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">IFSC Code</label>
              <input
                type="text"
                placeholder="e.g. HDFC0001234"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs uppercase focus:bg-white focus:outline-none focus:border-author-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">UPI ID (Optional)</label>
              <input
                type="text"
                placeholder="e.g. author@okhdfcbank"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-none focus:border-author-500"
              />
            </div>
          </div>
        </div>

        {/* 3. Tax Information (PAN, GST) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Receipt className="w-5 h-5 text-author-600" />
            <h2 className="text-base font-bold text-slate-900">Tax Information (PAN, GST)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">PAN Number</label>
              <input
                type="text"
                placeholder="ABCDE1234F"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs uppercase focus:bg-white focus:outline-none focus:border-author-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">GSTIN (If registered)</label>
              <input
                type="text"
                placeholder="22AAAAA0000A1Z5"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs uppercase focus:bg-white focus:outline-none focus:border-author-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-3 bg-author-600 hover:bg-author-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Author Settings'}</span>
        </button>
      </form>
    </div>
  );
};
