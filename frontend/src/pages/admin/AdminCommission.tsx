import React, { useState, useEffect } from 'react';
import { Percent, Save, CheckCircle2, DollarSign, ShieldCheck, Wallet } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export default function AdminCommission() {
  const { success, error } = useToast();
  const [commissionRate, setCommissionRate] = useState('15');
  const [minPayout, setMinPayout] = useState('1000');
  const [gstRate, setGstRate] = useState('18');
  const [currency, setCurrency] = useState('INR');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true);
        const res = await api.get<any>('/admin/settings');
        if (res.success && res.data) {
          if (res.data.platform_commission_rate) setCommissionRate(res.data.platform_commission_rate);
          if (res.data.minimum_payout_amount) setMinPayout(res.data.minimum_payout_amount);
          if (res.data.gst_tax_rate) setGstRate(res.data.gst_tax_rate);
          if (res.data.platform_currency) setCurrency(res.data.platform_currency);
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await api.put('/admin/settings', {
        platform_commission_rate: commissionRate,
        minimum_payout_amount: minPayout,
        gst_tax_rate: gstRate,
        platform_currency: currency,
      });

      if (res.success) {
        success('Commission configuration saved successfully.');
      }
    } catch (err: any) {
      error(err.message || 'Failed to update commission settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading commission settings...</div>;
  }

  const authorShare = 100 - parseFloat(commissionRate || '15');

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Percent className="w-7 h-7 text-purple-600" />
          <span>Commission & Royalty Engine</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure marketplace revenue splits, transaction fees, and automated author payout rules.
        </p>
      </div>

      {/* Split Visualization */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
            Active Revenue Distribution
          </span>
          <h2 className="text-xl sm:text-2xl font-black">
            Author: {authorShare}% | Platform: {commissionRate}%
          </h2>
          <p className="text-xs text-purple-200 max-w-md">
            For every ₹100 book purchase, the publishing author receives ₹{authorShare} directly into their available balance.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-xs text-center border border-white/10">
            <span className="text-[10px] text-purple-200 block font-semibold">Author Split</span>
            <span className="text-lg font-black">{authorShare}%</span>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-purple-500/40 text-center border border-white/20">
            <span className="text-[10px] text-purple-200 block font-semibold">Platform Fee</span>
            <span className="text-lg font-black">{commissionRate}%</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            Revenue Share Configuration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Platform Commission Rate (%) *</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  required
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <span className="text-[10px] text-slate-400">
                Default flat percentage retained by the marketplace (15%)
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Minimum Payout Threshold (₹) *</label>
              <input
                type="number"
                min="100"
                step="50"
                required
                value={minPayout}
                onChange={(e) => setMinPayout(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:border-purple-500"
              />
              <span className="text-[10px] text-slate-400">
                Minimum available balance required before an author can request withdrawal
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Statutory GST Rate (%) *</label>
              <input
                type="number"
                min="0"
                max="30"
                required
                value={gstRate}
                onChange={(e) => setGstRate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:border-purple-500"
              />
              <span className="text-[10px] text-slate-400">
                Applicable Indian Goods and Services Tax standard (18%)
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Settlement Currency</label>
              <input
                type="text"
                disabled
                value={currency}
                className="w-full px-3 py-2 bg-slate-100 border rounded-xl text-xs font-bold text-slate-600"
              />
              <span className="text-[10px] text-slate-400">Indian Rupee (INR - ₹)</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Update Commission Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
