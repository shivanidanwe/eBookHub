import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Wallet, TrendingUp, Percent, ArrowUpRight, ArrowDownRight, CreditCard } from 'lucide-react';
import { api } from '../../lib/api';
import { formatINR, formatDate } from '../../lib/utils';
import { StatCard } from '../../components/common/StatCard';
import { useToast } from '../../context/ToastContext';

export const AuthorEarnings: React.FC = () => {
  const { success, error } = useToast();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('1000');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadLedger() {
    try {
      setIsLoading(true);
      const res = await api.get<any>('/author/ledger');
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
    loadLedger();
  }, []);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(payoutAmount);
    if (!amountNum || amountNum < 1000) {
      error('Minimum payout request amount is ₹1,000.');
      return;
    }

    if (data && amountNum * 100 > data.availableBalance) {
      error(`Requested amount exceeds available balance of ${formatINR(data.availableBalance)}.`);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/author/payouts/request', { amount: amountNum });
      if (res.success) {
        success('Payout request submitted successfully! It will be reviewed by platform administration.');
        setPayoutModalOpen(false);
        loadLedger();
      }
    } catch (err: any) {
      error(err.message || 'Failed to submit payout request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableBalance = data?.availableBalance || 0;
  const totalEarnings = data?.totalEarnings || 0;
  const entries = data?.entries || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Earnings & Financial Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent breakdown of student book sales, platform split, and withdrawal history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setPayoutModalOpen(true)}
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Wallet className="w-4 h-4" />
            <span>Request Payout</span>
          </button>
          <Link
            to="/author/payouts"
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <CreditCard className="w-4 h-4 text-slate-500" />
            <span>View Payouts</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Available Balance"
          value={formatINR(availableBalance)}
          icon={Wallet}
          accentColor="author"
          subtitle="Ready for withdrawal (Min ₹1,000)"
        />
        <StatCard
          title="Total Lifetime Royalties"
          value={formatINR(totalEarnings)}
          icon={DollarSign}
          accentColor="emerald"
          subtitle="Net author earnings (85% split)"
        />
        <StatCard
          title="Platform Commission"
          value="15% Flat"
          icon={Percent}
          accentColor="admin"
          subtitle="Covers hosting, payment fees & delivery"
        />
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-6 sm:p-8">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Financial Ledger Entries</h2>
            <p className="text-xs text-slate-500">Chronological transaction credits, commissions, and payout debits</p>
          </div>
          <span className="text-xs font-semibold text-slate-400">{entries.length} Entries</span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
            No ledger transactions yet. Credits will be logged automatically upon eBook sales.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Transaction Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((entry: any) => {
                  const isCredit = entry.type === 'SALE_CREDIT' || entry.type === 'REFUND_REVERSAL';
                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {formatDate(entry.createdAt)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-bold text-[10px] px-2 py-0.5 rounded-full ${
                            isCredit
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {entry.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">{entry.description}</td>
                      <td className="py-3.5 px-4 font-bold">
                        <span className={isCredit ? 'text-emerald-600' : 'text-rose-600'}>
                          {isCredit ? '+' : '-'}{formatINR(entry.amount)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                        {formatINR(entry.balanceAfter)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout Modal */}
      {payoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Request Author Payout</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Available balance: <strong>{formatINR(availableBalance)}</strong>. Minimum withdrawal is ₹1,000.
              </p>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Withdrawal Amount (₹) *</label>
                <input
                  type="number"
                  min="1000"
                  max={availableBalance / 100}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                  required
                />
                <span className="text-[10px] text-slate-400">Enter amount in Rupees (minimum ₹1,000)</span>
              </div>

              <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-900 space-y-1">
                <p className="font-bold">Banking Settlement:</p>
                <p className="text-[11px] leading-relaxed">
                  Funds will be wired via NEFT/UPI to the bank account registered on your author profile. Ensure your IFSC code and account number are up to date.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
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
                  {isSubmitting ? 'Submitting...' : 'Submit Payout Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
