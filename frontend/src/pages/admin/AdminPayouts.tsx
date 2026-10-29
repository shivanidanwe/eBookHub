import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { 
  Banknote, CheckCircle, XCircle, Clock, Eye, AlertCircle, 
  ExternalLink, Building2, Check, X, ShieldAlert 
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import { formatINR } from '../../lib/utils';

interface PayoutItem {
  id: string;
  payoutNumber: string;
  authorId: string;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
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
  const { addToast } = useToast();
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'PENDING' | 'ALL' | 'COMPLETED' | 'REJECTED'>('PENDING');

  // Settlement modal
  const [selectedPayout, setSelectedPayout] = useState<PayoutItem | null>(null);
  const [settlementRef, setSettlementRef] = useState('');
  const [settleModalOpen, setSettleModalOpen] = useState(false);

  // Reject modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/payouts');
      if (res.success && res.data) {
        setPayouts(res.data);
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to fetch payout requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const handleProcess = async (id: string, action: 'COMPLETE' | 'REJECT', refOrReason: string) => {
    try {
      setProcessingId(id);
      const payload: any = { action };
      if (action === 'COMPLETE') {
        payload.settlementReference = refOrReason || `NEFT_${Date.now()}`;
      } else {
        payload.reason = refOrReason || 'Administrative rejection';
      }

      const res = await api.post(`/admin/payouts/${id}/process`, payload);
      if (res.success) {
        addToast(
          action === 'COMPLETE'
            ? 'Payout marked as COMPLETED and settlement reference recorded.'
            : 'Payout rejected and balance returned to author.',
          'success'
        );
        setSettleModalOpen(false);
        setRejectModalOpen(false);
        setSelectedPayout(null);
        setSettlementRef('');
        setRejectReason('');
        fetchPayouts();
      }
    } catch (err: any) {
      addToast(err.message || 'Process failed', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredPayouts = payouts.filter((p) => {
    if (filter === 'ALL') return true;
    return p.status === filter;
  });

  const pendingCount = payouts.filter((p) => p.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Banknote className="w-7 h-7 text-purple-600" /> Author Payout Settlements
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review author withdrawal requests, verify bank accounts/UPI IDs, and record banking settlement references.
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm font-medium">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>{pendingCount} Pending Settlement</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {(['PENDING', 'ALL', 'COMPLETED', 'REJECTED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filter === tab
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab === 'PENDING' ? 'Pending Requests' : tab === 'ALL' ? 'All Payouts' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            <span className="ml-2 text-xs opacity-80">
              ({payouts.filter(p => tab === 'ALL' ? true : p.status === tab).length})
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading payout requests...
        </div>
      ) : filteredPayouts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800">No payout requests found</h3>
          <p className="text-sm text-slate-500 mt-1">There are no author payouts under this filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Payout #</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Account / UPI</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Requested On</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayouts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                      #{p.payoutNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{p.author?.fullName}</div>
                      <div className="text-xs text-slate-500">{p.author?.user?.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {p.author?.bankName ? (
                        <div>
                          <div className="font-medium text-slate-800">{p.author.bankName}</div>
                          <div className="text-slate-500 font-mono">A/C: {p.author.accountNumber}</div>
                          <div className="text-slate-400 font-mono">IFSC: {p.author.ifscCode}</div>
                        </div>
                      ) : p.author?.upiId ? (
                        <div className="font-mono text-purple-700 font-medium">UPI: {p.author.upiId}</div>
                      ) : (
                        <span className="text-slate-400 italic">No details saved</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-base">
                      {formatINR(p.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge
                        variant={
                          p.status === 'COMPLETED' ? 'success' : p.status === 'PENDING' ? 'warning' : 'danger'
                        }
                      >
                        {p.status}
                      </Badge>
                      {p.settlementReference && (
                        <div className="text-[10px] font-mono text-slate-500 mt-1 truncate max-w-[120px]" title={p.settlementReference}>
                          Ref: {p.settlementReference}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-right space-x-2">
                      {p.status === 'PENDING' ? (
                        <>
                          <button
                            onClick={() => {
                              setSelectedPayout(p);
                              setSettlementRef(`NEFT_${Date.now()}`);
                              setSettleModalOpen(true);
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition inline-flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Settle
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPayout(p);
                              setRejectModalOpen(true);
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition inline-flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settle Modal */}
      {settleModalOpen && selectedPayout && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-emerald-600">
              <CheckCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-slate-900">Complete Settlement</h3>
            </div>
            <p className="text-sm text-slate-600">
              Confirm bank transfer of <span className="font-bold text-slate-900">{formatINR(selectedPayout.amount)}</span> to author <span className="font-semibold">{selectedPayout.author?.fullName}</span>.
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
              <div>Bank: <span className="font-semibold text-slate-800">{selectedPayout.author?.bankName || 'N/A'}</span></div>
              <div>Account: <span className="font-mono text-slate-800">{selectedPayout.author?.accountNumber || 'N/A'}</span></div>
              <div>IFSC: <span className="font-mono text-slate-800">{selectedPayout.author?.ifscCode || 'N/A'}</span></div>
              {selectedPayout.author?.upiId && (
                <div>UPI: <span className="font-mono text-purple-700">{selectedPayout.author.upiId}</span></div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Banking Reference Number (UTR / NEFT / IMPS) *
              </label>
              <input
                type="text"
                required
                value={settlementRef}
                onChange={(e) => setSettlementRef(e.target.value)}
                placeholder="e.g. NEFT1234567890"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSettleModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleProcess(selectedPayout.id, 'COMPLETE', settlementRef)}
                disabled={processingId === selectedPayout.id || !settlementRef.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium disabled:opacity-50"
              >
                Mark as Settled
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && selectedPayout && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-lg font-bold text-slate-900">Reject Payout Request</h3>
            </div>
            <p className="text-sm text-slate-600">
              Rejecting this payout will immediately reverse <span className="font-bold text-slate-900">{formatINR(selectedPayout.amount)}</span> back to the author's available balance with an audit ledger entry.
            </p>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Reason for Rejection *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Invalid IFSC code or beneficiary account number does not match registered name."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleProcess(selectedPayout.id, 'REJECT', rejectReason)}
                disabled={processingId === selectedPayout.id || !rejectReason.trim()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-medium disabled:opacity-50"
              >
                Confirm Rejection & Reversal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
