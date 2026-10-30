import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, ArrowUpRight, Clock, CheckCircle2, AlertCircle, Eye, X, Building2, Wallet } from 'lucide-react';
import { api } from '../../lib/api';
import { formatINR, formatDate } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';

export const AuthorPayouts: React.FC = () => {
  const { success, error } = useToast();
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'REQUESTED' | 'COMPLETED' | 'REJECTED'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<any | null>(null);
  const [amount, setAmount] = useState('1000');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadPayouts() {
    try {
      setIsLoading(true);
      const res = await api.get<any>('/author/payouts');
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPayouts();
  }, []);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num < 1000) {
      error('Minimum withdrawal request is ₹1,000.');
      return;
    }

    if (data && num * 100 > data.availableBalance) {
      error(`Requested amount exceeds available balance of ${formatINR(data.availableBalance)}.`);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/author/payouts/request', { amount: num });
      if (res.success) {
        success('Payout request submitted for administration review!');
        setPayoutModalOpen(false);
        loadPayouts();
      }
    } catch (err: any) {
      error(err.message || 'Failed to submit payout request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const payouts = data?.payouts || [];
  const availableBalance = data?.availableBalance || 0;
  const bankDetails = data?.bankDetails || {};

  const filteredPayouts = payouts.filter((p: any) => {
    if (activeTab === 'ALL') return true;
    return p.status === activeTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Author Payouts & Disbursements</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit bank withdrawal requests and track administrative settlement references.
          </p>
        </div>

        <button
          onClick={() => setPayoutModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0"
        >
          <Wallet className="w-4 h-4" />
          <span>Request Payout</span>
        </button>
      </div>

      {/* Balance & Account Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available for Payout</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Balance
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{formatINR(availableBalance)}</p>
          <p className="text-xs text-slate-400">
            Minimum withdrawal: <strong>₹1,000.00</strong> • 85% net direct royalties
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Settlement Target</span>
            <Building2 className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-sm font-bold text-slate-900">
            {bankDetails.bankName || 'Direct Bank Settlement'}
          </p>
          <p className="text-xs text-slate-600 font-mono">
            A/C: {bankDetails.accountNumber ? `••••${bankDetails.accountNumber.slice(-4)}` : 'Not configured'}{' '}
            • IFSC: {bankDetails.ifscCode || 'N/A'}
          </p>
          {bankDetails.upiId && (
            <p className="text-[11px] text-slate-500 font-mono">UPI ID: {bankDetails.upiId}</p>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['ALL', 'REQUESTED', 'COMPLETED', 'REJECTED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === tab
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab === 'ALL'
              ? 'All Requests'
              : tab === 'REQUESTED'
              ? 'Pending Review'
              : tab === 'COMPLETED'
              ? 'Settled'
              : 'Rejected'}
          </button>
        ))}
      </div>

      {/* Payout History Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredPayouts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-500 space-y-2">
          <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-700">No payout records in this view.</p>
          <p className="text-slate-400">When you request a payout, its progress and bank transfer reference will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Payout #</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Requested On</th>
                  <th className="py-3.5 px-4">Settlement Status</th>
                  <th className="py-3.5 px-4">Settlement Reference</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayouts.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      #{p.payoutNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatINR(p.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {formatDate(p.createdAt)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full ${
                          p.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'REQUESTED' || p.status === 'PROCESSING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.status === 'REQUESTED' ? 'Pending Review' : p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {p.settlementReference || (
                        <span className="text-slate-400 italic">Pending Transfer</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedPayout(p)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-slate-400" />
                        <span>View Payout</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Payout Settlement Status Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-extrabold text-slate-900 text-base">
                Payout #{selectedPayout.payoutNumber} Details
              </h3>
              <button
                onClick={() => setSelectedPayout(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Requested Amount:</span>
                <span className="font-bold text-slate-900">{formatINR(selectedPayout.amount)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Requested On:</span>
                <span className="font-medium text-slate-800">{formatDate(selectedPayout.createdAt)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Settlement Status:</span>
                <span className="font-bold text-slate-900">{selectedPayout.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Settlement Reference:</span>
                <span className="font-mono font-bold text-orange-700">
                  {selectedPayout.settlementReference || 'Awaiting Bank Transfer'}
                </span>
              </div>
              {selectedPayout.rejectionReason && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900">
                  <p className="font-bold">Rejection Reason:</p>
                  <p className="text-[11px] mt-0.5">{selectedPayout.rejectionReason}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedPayout(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Payout Modal */}
      {payoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Request Payout Disbursement</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Available balance: <strong>{formatINR(availableBalance)}</strong>
              </p>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Disbursement Amount (₹) *</label>
                <input
                  type="number"
                  min="1000"
                  max={availableBalance / 100}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                  required
                />
                <span className="text-[10px] text-slate-400">Minimum withdrawal is ₹1,000</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">Target Bank Account:</p>
                <p className="text-[11px] font-mono">
                  {bankDetails.bankName || 'Bank'} • A/C: {bankDetails.accountNumber ? `••••${bankDetails.accountNumber.slice(-4)}` : 'Not set'}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPayoutModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || availableBalance < 100000}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
