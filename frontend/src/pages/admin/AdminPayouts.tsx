import React, { useState, useEffect } from 'react';
import { 
  Banknote, CheckCircle, XCircle, Clock, Eye, AlertCircle, 
  Building2, Check, X, ShieldAlert 
} from 'lucide-react';
import { formatINR, formatDate } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';

interface PayoutItem {
  id: string;
  payoutNumber: string;
  authorId: string;
  amount: number;
  status: 'REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  settlementReference?: string;
  rejectionReason?: string;
  createdAt: string;
  author: {
    fullName: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    upiId?: string;
    user: {
      email: string;
    };
  };
}

export default function AdminPayouts() {
  const { success, error } = useToast();
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'REQUESTED' | 'ALL' | 'COMPLETED' | 'REJECTED'>('REQUESTED');

  // Settlement modal
  const [selectedPayout, setSelectedPayout] = useState<PayoutItem | null>(null);
  const [settlementRef, setSettlementRef] = useState('');
  const [settleModalOpen, setSettleModalOpen] = useState(false);

  // Reject modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Bank account number mismatch or IFSC verification failure');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/payouts');
      if (res.success && res.data) {
        setPayouts(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Failed to fetch payout requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const handleProcess = async (id: string, action: 'APPROVE' | 'COMPLETE' | 'REJECT', refOrReason: string) => {
    try {
      setProcessingId(id);
      const payload: any = { action };
      if (action === 'COMPLETE') {
        payload.settlementReference = refOrReason || `NEFT_${Date.now()}`;
      } else if (action === 'REJECT') {
        payload.reason = refOrReason || 'Administrative rejection';
      }

      const res = await api.post(`/admin/payouts/${id}/process`, payload);
      if (res.success) {
        success(
          action === 'APPROVE'
            ? 'Payout approved and queued for banking settlement.'
            : action === 'COMPLETE'
            ? 'Payout marked as COMPLETED and settlement reference recorded.'
            : 'Payout rejected and balance returned to author available balance.'
        );
        setSettleModalOpen(false);
        setRejectModalOpen(false);
        setSelectedPayout(null);
        setSettlementRef('');
        setRejectReason('Bank account number mismatch or IFSC verification failure');
        fetchPayouts();
      }
    } catch (err: any) {
      error(err.message || 'Process failed');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredPayouts = payouts.filter((p) => {
    if (filter === 'ALL') return true;
    return p.status === filter;
  });

  const pendingCount = payouts.filter((p) => p.status === 'REQUESTED' || p.status === 'PROCESSING').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Banknote className="w-7 h-7 text-purple-600" />
            <span>Author Payout Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review author withdrawal requests, approve banking transfers, and record confirmed settlement references.
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>{pendingCount} Pending Settlement</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {(['REQUESTED', 'ALL', 'COMPLETED', 'REJECTED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filter === tab
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab === 'REQUESTED'
              ? 'Pending Review'
              : tab === 'ALL'
              ? 'All Payouts'
              : tab === 'COMPLETED'
              ? 'Settled'
              : 'Rejected'}
            <span className="ml-1.5 text-[10px] opacity-80">
              ({payouts.filter((p) => (tab === 'ALL' ? true : p.status === tab)).length})
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredPayouts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-500">
          No payout requests found under this filter.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Payout #</th>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Bank / UPI Destination</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Requested On</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayouts.map((p) => {
                  const isPending = p.status === 'REQUESTED';
                  const isProcessing = p.status === 'PROCESSING';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        #{p.payoutNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{p.author?.fullName}</p>
                        <p className="text-[11px] text-slate-400">{p.author?.user?.email}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">{p.author?.bankName || 'Direct Transfer'}</p>
                        <p className="font-mono text-[11px] text-slate-500">
                          A/C: {p.author?.accountNumber || 'N/A'} • IFSC: {p.author?.ifscCode || 'N/A'}
                        </p>
                        {p.author?.upiId && (
                          <p className="font-mono text-[10px] text-slate-400">UPI: {p.author.upiId}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatINR(p.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
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
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        {isPending && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleProcess(p.id, 'APPROVE', '')}
                              disabled={processingId === p.id}
                              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-[11px] rounded-lg transition"
                            >
                              Approve Payout
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPayout(p);
                                setSettleModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition"
                            >
                              Mark Settled
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPayout(p);
                                setRejectModalOpen(true);
                              }}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200"
                              title="Reject Payout"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {isProcessing && (
                          <button
                            onClick={() => {
                              setSelectedPayout(p);
                              setSettleModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition"
                          >
                            Mark Settlement Complete
                          </button>
                        )}

                        {p.status === 'COMPLETED' && (
                          <span className="font-mono text-[11px] font-semibold text-purple-700">
                            Ref: {p.settlementReference || 'Settled'}
                          </span>
                        )}

                        {p.status === 'REJECTED' && (
                          <span className="text-[11px] font-semibold text-rose-600">Rejected & Refunded</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mark Settlement Complete Modal */}
      {settleModalOpen && selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Record Settlement for #{selectedPayout.payoutNumber}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Author: <strong>{selectedPayout.author?.fullName}</strong> • Amount: <strong>{formatINR(selectedPayout.amount)}</strong>
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Banking / UPI Settlement Reference *</label>
                <input
                  type="text"
                  placeholder="e.g. NEFT1234567890 / UTR20261029..."
                  value={settlementRef}
                  onChange={(e) => setSettlementRef(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-purple-500"
                  required
                />
                <span className="text-[10px] text-slate-400">
                  Confirmed bank transfer or UPI transaction reference for audit tracking.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSettleModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processingId === selectedPayout.id || !settlementRef.trim()}
                onClick={() => handleProcess(selectedPayout.id, 'COMPLETE', settlementRef)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition disabled:opacity-50"
              >
                {processingId === selectedPayout.id ? 'Recording...' : 'Mark Settlement Complete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Payout Modal */}
      {rejectModalOpen && selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Reject Payout Request</h3>
                <p className="text-xs text-slate-500">#{selectedPayout.payoutNumber} for {formatINR(selectedPayout.amount)}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Rejecting this request will automatically refund the full amount back to the author's available balance and record a ledger reversal entry.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Rejection Explanation *</label>
              <textarea
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processingId === selectedPayout.id}
                onClick={() => handleProcess(selectedPayout.id, 'REJECT', rejectReason)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
              >
                {processingId === selectedPayout.id ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
