import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, Smartphone, Building } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { api } from '../../lib/api';
import { formatINR } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';

export const UserCheckout: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, itemCount, subtotal, discount, appliedCoupon, total, refreshCart } = useCart();
  const { toast, error } = useToast();

  const [billingName, setBillingName] = useState(user?.fullName || 'Shivani Sharma');
  const [billingEmail, setBillingEmail] = useState(user?.email || 'shivani@example.com');
  const [billingPhone, setBillingPhone] = useState('+91 99887 66554');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING' | 'RAZORPAY_SANDBOX'>('RAZORPAY_SANDBOX');
  const [isProcessing, setIsProcessing] = useState(false);

  if (itemCount === 0) {
    navigate('/user/cart');
    return null;
  }

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billingName || !billingEmail) {
      toast('Please provide your name and email for the invoice.', 'error');
      return;
    }

    try {
      setIsProcessing(true);

      // Step 1: Create Order on Backend
      const orderRes = await api.post<any>('/orders/create', {
        billingName,
        billingEmail,
        billingPhone,
        couponCode: appliedCoupon || undefined,
      });

      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.message || 'Failed to initialize order');
      }

      const createdOrder = orderRes.data;

      // Step 2: Initiate Payment Sandbox
      const payInitRes = await api.post<any>('/payments/initiate', {
        orderId: createdOrder.id,
        method: paymentMethod,
      });
      if (!payInitRes.success || payInitRes.data?.mode !== 'DEMO') {
        throw new Error(payInitRes.message || 'Demo checkout could not be initialized.');
      }

      // Step 3: Complete verification with backend (Sandbox verification)
      const verifyRes = await api.post<any>('/payments/verify', {
        orderId: createdOrder.id,
        providerPaymentId: `pay_sandbox_${Date.now()}`,
        signature: 'sandbox_test_verified_signature',
        simulateSuccess: true,
      });

      if (verifyRes.success) {
        await refreshCart();
        navigate(`/user/payment-result?orderId=${createdOrder.orderNumber}&amount=${createdOrder.totalAmount}&mode=DEMO`);
      } else {
        throw new Error(verifyRes.message || 'Payment verification failed');
      }
    } catch (err: any) {
      error(err.message || 'Transaction could not be completed.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Checkout & Payment</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Complete your purchase to receive instant access to your digital eBooks.
        </p>
      </div>

      <form onSubmit={handleProcessPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Billing Details & Payment Method Selection (Matching Screen 6) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Billing / Invoice Details */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              1. Billing & Entitlement License Details
            </h2>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={billingName}
                  onChange={(e) => setBillingName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Email Address (for License)</label>
                  <input
                    type="email"
                    required
                    value={billingEmail}
                    onChange={(e) => setBillingEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={billingPhone}
                    onChange={(e) => setBillingPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selector (Matching Screen 6 of Mockup) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              2. Select Payment Method
            </h2>

            <div className="space-y-3">
              {/* Option 1: Razorpay Test Mode / Sandbox */}
              <label
                className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 transition cursor-pointer ${
                  paymentMethod === 'RAZORPAY_SANDBOX'
                    ? 'border-brand-600 bg-brand-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'RAZORPAY_SANDBOX'}
                  onChange={() => setPaymentMethod('RAZORPAY_SANDBOX')}
                  className="mt-1 text-brand-600 focus:ring-brand-500"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">
                      Development Demo Checkout
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Test Mode
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    No charge will be collected. Demo checkouts do not create real sales or earnings.
                  </p>
                </div>
              </label>

              {/* Option 2: UPI */}
              <label
                className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 transition cursor-pointer ${
                  paymentMethod === 'UPI'
                    ? 'border-brand-600 bg-brand-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'UPI'}
                  onChange={() => setPaymentMethod('UPI')}
                  className="mt-1 text-brand-600 focus:ring-brand-500"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">
                      UPI (Google Pay, PhonePe, Paytm, BHIM)
                    </span>
                    <Smartphone className="w-4 h-4 text-brand-600" />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Instant scan or direct UPI ID payment confirmation.
                  </p>
                </div>
              </label>

              {/* Option 3: Card */}
              <label
                className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 transition cursor-pointer ${
                  paymentMethod === 'CARD'
                    ? 'border-brand-600 bg-brand-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'CARD'}
                  onChange={() => setPaymentMethod('CARD')}
                  className="mt-1 text-brand-600 focus:ring-brand-500"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">
                      Credit / Debit Card (RuPay, Visa, Mastercard)
                    </span>
                    <CreditCard className="w-4 h-4 text-slate-600" />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    All major Indian banks and RuPay cards accepted.
                  </p>
                </div>
              </label>

              {/* Option 4: Net Banking */}
              <label
                className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 transition cursor-pointer ${
                  paymentMethod === 'NETBANKING'
                    ? 'border-brand-600 bg-brand-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'NETBANKING'}
                  onChange={() => setPaymentMethod('NETBANKING')}
                  className="mt-1 text-brand-600 focus:ring-brand-500"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">
                      Net Banking (50+ Indian Banks)
                    </span>
                    <Building className="w-4 h-4 text-slate-600" />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    HDFC, SBI, ICICI, Axis, Kotak, and more.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Pay Button (Matching Screen 6) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Order Review ({itemCount} {itemCount === 1 ? 'eBook' : 'eBooks'})
          </h2>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-700 truncate max-w-[200px]">{item.title}</span>
                <span className="font-bold text-slate-900">{formatINR(item.effectivePrice)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">{formatINR(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Coupon ({appliedCoupon})</span>
                <span>-{formatINR(discount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-500">
              <span>GST & Digital Delivery</span>
              <span className="font-semibold text-slate-800">₹0 (Free)</span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">Total Payable Amount</span>
              <span className="text-2xl font-extrabold text-brand-600">{formatINR(total)}</span>
            </div>
          </div>

          {/* Pay Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-brand-500/25 transition flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Verifying Sandbox Payment...</span>
              </div>
            ) : (
              <span>Pay {formatINR(total)} & Access eBooks</span>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted 256-Bit SSL Payment Guarantee</span>
          </div>
        </div>
      </form>
    </div>
  );
};
