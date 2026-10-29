import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { 
  ShoppingBag, Search, Filter, Eye, CheckCircle2, Clock, 
  AlertCircle, X 
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import { formatINR } from '../../lib/utils';

interface OrderItem {
  id: string;
  orderNumber: string;
  userId: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  billingName?: string;
  billingEmail?: string;
  createdAt: string;
  user: {
    email: string;
    profile?: {
      fullName: string;
    };
  };
  items: {
    id: string;
    price: number;
    book: {
      title: string;
    };
  }[];
  payment?: {
    status: string;
    provider: string;
    providerPaymentId?: string;
  };
}

export default function AdminOrders() {
  const { addToast } = useToast();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/orders');
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to fetch platform orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.user?.email.toLowerCase().includes(q) ||
      (o.billingName && o.billingName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ShoppingBag className="w-7 h-7 text-purple-600" /> Platform Orders
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete ledger of student purchases, checkout transactions, and entitlements.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by order number (#ORD...), student email, or billing name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm outline-none"
        />
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading platform orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800">No orders found</h3>
          <p className="text-sm text-slate-500 mt-1">No orders match your search criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Books</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {order.billingName || order.user?.profile?.fullName || 'Student'}
                      </div>
                      <div className="text-xs text-slate-500">{order.user?.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-medium text-slate-700">
                        {order.items?.length || 0} eBook{order.items?.length === 1 ? '' : 's'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatINR(order.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge
                        variant={
                          order.status === 'COMPLETED' ? 'success' : order.status === 'PENDING' ? 'warning' : 'danger'
                        }
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Order #{selectedOrder.orderNumber}</h3>
                <p className="text-xs text-slate-500">
                  {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <div className="text-xs text-slate-500 uppercase font-semibold">Customer Details</div>
                <div className="font-semibold text-slate-800">{selectedOrder.billingName || 'Student'}</div>
                <div className="text-slate-600 text-xs">{selectedOrder.user?.email}</div>
              </div>

              <div>
                <div className="text-xs text-slate-500 uppercase font-semibold mb-2">Purchased Items</div>
                <div className="divide-y divide-slate-100 border rounded-xl overflow-hidden">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between bg-white text-xs">
                      <span className="font-medium text-slate-800">{item.book?.title}</span>
                      <span className="font-bold text-slate-900">{formatINR(item.price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatINR(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-{formatINR(selectedOrder.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>GST (18%)</span>
                  <span>{formatINR(selectedOrder.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t">
                  <span>Total Amount</span>
                  <span>{formatINR(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              {selectedOrder.payment && (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-xs space-y-1 text-purple-900">
                  <div className="font-semibold uppercase tracking-wider text-purple-700">Payment Gateway</div>
                  <div>Provider: {selectedOrder.payment.provider}</div>
                  <div>Payment ID: {selectedOrder.payment.providerPaymentId || 'N/A'}</div>
                  <div>Status: {selectedOrder.payment.status}</div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
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
