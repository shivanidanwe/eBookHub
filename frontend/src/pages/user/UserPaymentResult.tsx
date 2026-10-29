import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, BookOpen, ShoppingBag } from 'lucide-react';
import { formatINR } from '../../lib/utils';

export const UserPaymentResult: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const amountPaise = Number(searchParams.get('amount'));
  const isDemo = searchParams.get('mode') === 'DEMO';

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl max-w-md w-full p-8 sm:p-10 text-center space-y-6">
        {/* Large Green Checkmark (Matching Screen 7 of Mockup) */}
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isDemo ? 'Demo checkout complete' : 'Payment status unavailable'}
          </h1>
          <p className="text-xs text-slate-500">
            {isDemo
              ? 'No payment was collected. Demo access was added to your library.'
              : 'We could not confirm a verified payment for this order.'}
          </p>
        </div>

        {/* Transaction Card */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
          <div className="flex justify-between items-center text-slate-600">
            <span>Order Reference ID:</span>
            <span className="font-mono font-bold text-slate-900">{orderId ? `#${orderId}` : 'Unavailable'}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span>Paid Amount:</span>
            <span className="font-bold text-slate-900 text-sm">
              {Number.isFinite(amountPaise) && amountPaise > 0 ? formatINR(amountPaise) : 'Unavailable'}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span>License Status:</span>
            <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
              {isDemo ? 'Demo access granted' : 'Not confirmed'}
            </span>
          </div>
        </div>

        {/* Action Buttons (Matching Screen 7) */}
        <div className="space-y-3 pt-2">
          <Link
            to="/user/library"
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 transition flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>Go to My Library</span>
          </Link>

          <Link
            to="/user/orders"
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 text-slate-500" />
            <span>View Order Details</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
