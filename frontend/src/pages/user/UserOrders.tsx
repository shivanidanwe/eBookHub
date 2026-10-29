import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Calendar, CreditCard, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';
import { formatINR, formatDate } from '../../lib/utils';

export const UserOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        setIsLoading(true);
        const res = await api.get<any>('/orders');
        if (res.success && Array.isArray(res.data)) {
          setOrders(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrders()
;
  }, []);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Order History</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View all your previous purchases, transaction receipts, and digital entitlements.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No Orders Yet</h3>
          <p className="text-xs text-slate-500">Your purchased items will appear here.</p>
          <Link to="/books" className="inline-block px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl">
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-900">#{order.orderNumber}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(order.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                      order.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="font-extrabold text-slate-900">{formatINR(order.totalAmount)}</span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{item.book?.title}</span>
                    <span className="text-slate-500">{formatINR(item.price)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-between items-center text-xs">
                <Link
                  to={`/user/library`}
                  className="font-bold text-brand-600 hover:underline flex items-center gap-1"
                >
                  <span>Open in My Library</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to={`/user/orders/${order.id}`}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition"
                >
                  View Invoice
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
