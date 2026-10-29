import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, FileText, Printer } from 'lucide-react';
import { api } from '../../lib/api';
import { formatINR, formatDate } from '../../lib/utils';

export const UserOrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        setIsLoading(true);
        const res = await api.get<any>(`/orders/${orderId}`);
        if (res.success && res.data) {
          setOrder(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading invoice...</div>;
  }

  if (!order) {
    return <div className="p-8 text-center text-xs text-slate-500">Order not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <Link to="/user/orders" className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Tax Invoice</span>
        </button>
      </div>

      {/* Invoice Card */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">eBookHub Tax Invoice</span>
            <p className="text-xs text-slate-400 mt-0.5">Order Ref #{order.orderNumber}</p>
          </div>
          <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1 rounded-full">
            Paid & Verified
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6 text-xs text-slate-600">
          <div>
            <p className="font-bold text-slate-900 mb-1">Billed To:</p>
            <p>{order.billingName || 'Customer'}</p>
            <p>{order.billingEmail}</p>
            <p>{order.billingPhone || 'India'}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-900 mb-1">Invoice Details:</p>
            <p>Date: {formatDate(order.createdAt)}</p>
            <p>Payment: {order.paymentMethod || 'Razorpay'}</p>
            <p>Transaction: #{order.payment?.providerPaymentId || 'TXN-PAID'}</p>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex justify-between font-bold text-xs text-slate-900 pb-2 border-b">
            <span>Description</span>
            <span>Price</span>
          </div>

          {order.items?.map((item: any) => (
            <div key={item.id} className="flex justify-between text-xs py-1">
              <div>
                <p className="font-semibold text-slate-900">{item.book?.title}</p>
                <p className="text-[11px] text-slate-500">By {item.book?.author?.fullName}</p>
              </div>
              <span className="font-bold text-slate-900">{formatINR(item.price)}</span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{formatINR(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Discount</span>
              <span>-{formatINR(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-2 border-t">
            <span>Total Paid</span>
            <span className="text-brand-600 text-lg">{formatINR(order.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
