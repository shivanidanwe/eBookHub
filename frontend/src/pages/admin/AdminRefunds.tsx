import React, { useState, useEffect } from 'react';
import { RotateCcw, Search, AlertCircle, CheckCircle2, Eye, X, ShieldAlert } from 'lucide-react';
import { api } from '../../lib/api';
import { formatINR, formatDate } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';

export default function AdminRefunds() {
  const { success, error } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refundModalOrder, setRefundModalOrder] = useState<any | null>(null);
  const [refundReason, setRefundReason] = useState('Customer request / dissatisfaction');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/orders');
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundModalOrder) return;

    try {
      setIsProcessing(true);
      const res = await api.post(`/admin/orders/${refundModalOrder.id}/refund`, {
        reason: refundReason,
      });

      if (res.success) {
        success(res.message || 'Refund successfully processed. Entitlements revoked.');
        setRefundModalOrder(null);
        fetchOrders();
      }
    } catch (err: any) {
      error(err.message || 'Failed to process refund');
    } finally {
      setIsProcessing(false);
    }
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.user?.email.toLowerCase().includes(q) ||
      (o.billingName && o.billingName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <RotateCcw className="w-7 h-7 text-purple-600" />
            <span>Refunds & Order Cancellations</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Process student refund requests, revoke PDF entitlements, and record author ledger reversals.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search order # or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-500 shadow-xs"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-500">
          No orders found matching criteria.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Order Total</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((order) => {
                  const isRefunded = order.status === 'REFUNDED';
                  const isEligible = order.status === 'COMPLETED';

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {order.orderNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">{order.billingName || 'Student'}</p>
                        <p className="text-[11px] text-slate-400">{order.user?.email}</p>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {order.items?.length || 0} eBook(s)
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatINR(order.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full ${
                            isRefunded
                              ? 'bg-rose-100 text-rose-800'
                              : order.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        {isRefunded ? (
                          <span className="text-[11px] font-semibold text-slate-400">Refund Settled</span>
                        ) : isEligible ? (
                          <button
                            onClick={() => setRefundModalOrder(order)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] rounded-lg transition inline-flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Process Refund</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">Non-settled</span>
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

      {/* Process Refund Modal */}
      {refundModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Confirm Refund for {refundModalOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setRefundModalOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-1">
                <p className="font-bold">Refund Impact:</p>
                <p className="text-[11px] leading-relaxed">
                  • Amount to be refunded: <strong>{formatINR(refundModalOrder.totalAmount)}</strong>.<br />
                  • Digital library access and PDF downloads for all items in this order will be immediately revoked.<br />
                  • Author earnings for these items will be reversed in their ledger.
                </p>
              </div>

              <div className="space-y-1 pt-2">
                <label className="text-xs font-bold text-slate-700">Reason for Refund *</label>
                <textarea
                  rows={2}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRefundModalOrder(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleProcessRefund}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Confirm & Process Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
