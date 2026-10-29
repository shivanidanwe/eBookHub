import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { 
  CreditCard, Search, ArrowUpRight, CheckCircle2, Clock, 
  AlertCircle, Download 
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import { formatINR } from '../../lib/utils';

interface TransactionItem {
  transactionId: string;
  orderId: string;
  user: string;
  amount: number;
  status: string;
  date: string;
}

export default function AdminTransactions() {
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/transactions');
      if (res.success && res.data) {
        setTransactions(res.data);
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to fetch transactions', 'error');
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
    .filter((t) => t.status === 'COMPLETED' || t.status === 'CAPTURED')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-purple-600" /> Financial Transactions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time ledger of inbound gateway payments and platform settlements.
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-100 px-4 py-2 rounded-xl text-sm font-semibold text-purple-900">
          Total Settled: <span className="text-purple-700">{formatINR(totalProcessed)}</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by transaction ID, order ID, or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm outline-none"
        />
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading transactions...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800">No transactions found</h3>
          <p className="text-sm text-slate-500 mt-1">No payments match your search.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900 text-xs">
                      {t.transactionId}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-purple-700 text-xs">
                      {t.orderId}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium">
                      {t.user}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatINR(t.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge
                        variant={
                          t.status === 'COMPLETED' || t.status === 'CAPTURED'
                            ? 'success'
                            : t.status === 'PENDING'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {t.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
