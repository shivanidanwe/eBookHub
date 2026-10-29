import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Clock, CheckCircle2, ArrowRight, Building, Smartphone } from 'lucide-react';
import { api } from '../../lib/api';
import { formatINR, formatDate } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';

export const AuthorPayouts: React.FC = () => {
  const { toast, success, error } = useToast();
  const [data, setData] = useState<any>(null);
  const [requestAmount, setRequestAmount] = useState('10000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  async function loadPayouts() {
    try {
      setIsLoading(true);
      const res = await api.get<any>('/author/payouts');
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
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
    const amountNum = parseFloat(requestAmount);
    if (!amountNum || amountNum < 1000) {
      toast('Minimum payout request is ₹1,000.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post<any>('/author/payouts/request', {
        amount: amountNum,
      });

      if (res.success) {
        success('Payout request submitted for administrative review!');
        await loadPayouts();
      }
    } catch (err: any) {
      error(err.message || 'Payout request failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableBalance = data?.availableBalance || 3624000;
  const payouts = data?.payouts || [];
  const bankDetails = data?.bankDetails || {};

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Author Payouts & Settlements</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Request automated bank transfer settlements from your verified sales balance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Payout Request Card (Matching Screen 8 of Mockup) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">Request New Payout</h2>
            <p className="text-xs text-slate-500">Withdraw funds to your verified bank or UPI ID</p>
          </div>

          {/* Available Balance Box */}
          <div className="p-5 rounded-2xl bg-author-50/60 border border-author-200/60 space-y-1">
            <span className="text-xs font-semibold text-author-800">Available Payout Balance</span>
            <p className="text-3xl font-extrabold text-author-700">{formatINR(availableBalance)}</p>
            <p className="text-[10px] text-author-600 font-medium">Minimum threshold: ₹1,000.00</p>
          </div>

          <form onSubmit={handleRequestPayout} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Withdrawal Amount (₹)</label>
              <input
                type="number"
                min={1000}
                required
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-author-500"
              />
            </div>

            {/* Destination Preview */}
            <div className="p-3.5 bg-slate-50 rounded-xl border text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block">Settlement Destination:</span>
              <p>Bank: {bankDetails.bankName || 'HDFC Bank'} (A/C: {bankDetails.accountNumber || '••••4892'})</p>
              <p>UPI: {bankDetails.upiId || 'rohanmehta@okhdfcbank'}</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || availableBalance < 100000}
              className="w-full py-3.5 bg-author-600 hover:bg-author-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Submitting...' : 'Request Payout'}
            </button>
          </form>
        </div>

        {/* Payout History Table (Matching Screen 8 of Mockup) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Payout History</h2>
            <span className="text-xs text-slate-400 font-medium">{payouts.length} requests</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Payout ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payouts.length > 0 ? (
                  payouts.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">#{p.payoutNumber}</td>
                      <td className="py-3.5 px-4 text-slate-500">{formatDate(p.createdAt)}</td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">{formatINR(p.amount)}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full ${
                            p.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      No payout requests yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
