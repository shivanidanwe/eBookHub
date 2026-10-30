import React, { useState, useEffect } from 'react';
import { CreditCard, Search, ArrowUpRight, CheckCircle2, Clock, AlertCircle, Eye, X, ShieldCheck } from 'lucide-react';
import Badge from '../../components/common/Badge';
import { formatINR, formatDate } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';

interface TransactionItem {
  transactionId: string;
  orderId: string;
  user: string;
  amount: number;
  status: string;
  date: string;
}

export default function AdminTransactions() {
  const { error } = useToast();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTxn, setSelectedTxn] = useState<TransactionItem | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/transactions');
      if (res.success && res.data) {
        setTransactions(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filtered = transactions.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.transactionId.toLowerCase().includes(q) ||
      t.orderId.toLowerCase().includes(q) ||
      t.user.toLowerCase().includes(q)
    );
  });

  const totalProcessed = transactions
    .filter((t) => t.status === 'COMPLETED' || t.status === 'SUCCESS' || t.status === 'CAPTURED')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-purple-600" />
            <span>Financial Transactions</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified payment gateway charges, order references, and platform settlement records.
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 px-4 py-2 rounded-xl text-xs font-bold text-purple-900">
          Total Settled: <span className="text-purple-700 font-extrabold">{formatINR(totalProcessed)}</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by transaction ID, order number, or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs outline-none"
        />
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-500">
          No transactions match your search.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Transaction ID</th>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-xs">
                      {t.transactionId}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-purple-700 text-xs font-semibold">
                      {t.orderId}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium">
                      {t.user}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatINR(t.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(t.date)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full ${
                          t.status === 'COMPLETED' || t.status === 'SUCCESS' || t.status === 'CAPTURED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedTxn(t)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-slate-400" />
                        <span>View Transaction</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Verified Payment Details</h3>
              </div>
              <button
                onClick={() => setSelectedTxn(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono font-bold text-slate-900">{selectedTxn.transactionId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Associated Order:</span>
                <span className="font-mono font-bold text-purple-700">{selectedTxn.orderId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Billing Customer:</span>
                <span className="font-semibold text-slate-800">{selectedTxn.user}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Paid Amount:</span>
                <span className="font-extrabold text-slate-900 text-sm">{formatINR(selectedTxn.amount)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Payment Status:</span>
                <span className="font-bold text-emerald-700">{selectedTxn.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Timestamp:</span>
                <span className="text-slate-700">{formatDate(selectedTxn.date)}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTxn(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
