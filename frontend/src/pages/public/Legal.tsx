import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShieldCheck, HelpCircle, FileText, RefreshCw } from 'lucide-react';

export const Legal: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  let title = 'Help & Support Center';
  let icon = HelpCircle;

  if (path === '/terms') {
    title = 'Terms of Service';
    icon = FileText;
  } else if (path === '/privacy') {
    title = 'Privacy Policy';
    icon = ShieldCheck;
  } else if (path === '/refund-policy') {
    title = 'Refund & Cancellation Policy';
    icon = RefreshCw;
  } else if (path === '/faq') {
    title = 'Frequently Asked Questions (FAQ)';
    icon = HelpCircle;
  }

  const IconComponent = icon;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
        <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl">
          <IconComponent className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
          <p className="text-xs text-slate-500 mt-1">Effective Date: October 2026 | eBookHub India Platform Guidelines</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
        {path === '/terms' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">1. Acceptance of Terms</h2>
            <p>
              By accessing and purchasing educational materials on eBookHub, you agree to comply with Indian intellectual property laws, copyright regulations, and these terms of use.
            </p>

            <h2 className="text-lg font-bold text-slate-900">2. Digital Content Licenses</h2>
            <p>
              eBooks purchased on eBookHub are licensed exclusively for the purchaser's personal educational and study use. Redistribution, commercial reselling, or unauthorized public mirroring of PDF files is strictly prohibited.
            </p>

            <h2 className="text-lg font-bold text-slate-900">3. Author Obligations & Revenue Share</h2>
            <p>
              Authors retain intellectual ownership of their educational materials. By submitting manuscripts to eBookHub, authors confirm they hold the legal right to distribute the content. eBookHub deducts a 15% platform commission on settled sales.
            </p>
          </div>
        )}

        {path === '/privacy' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">1. Information We Collect</h2>
            <p>
              We collect your name, email address, transaction identifiers, and reading progress records to deliver purchased digital eBooks and sync bookmarks across devices.
            </p>

            <h2 className="text-lg font-bold text-slate-900">2. Payment Security</h2>
            <p>
              We do not store your credit card numbers or UPI MPINs. All payments are securely processed through Razorpay and certified Indian payment banking gateways under RBI guidelines.
            </p>
          </div>
        )}

        {path === '/refund-policy' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">1. Digital Product Refund Conditions</h2>
            <p>
              Because eBooks provide instantaneous PDF download and reader access, refunds are evaluated on a case-by-case basis within 48 hours of purchase if you experienced unresolvable technical download corruptions.
            </p>

            <h2 className="text-lg font-bold text-slate-900">2. Free Sample Previews</h2>
            <p>
              Every book offers free sample preview pages. Readers are strongly encouraged to inspect preview samples before finalizing purchases.
            </p>
          </div>
        )}

        {(path === '/help' || path === '/faq') && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-base">How do I access my purchased eBooks?</h3>
              <p className="text-xs text-slate-600">
                Immediately after successful payment verification, your eBooks appear under <Link to="/user/library" className="text-brand-600 font-semibold underline">My Library</Link>. You can read online anytime or download authorized PDF files for offline study.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-base">What payment methods are supported?</h3>
              <p className="text-xs text-slate-600">
                We support all major Indian payment methods including UPI (Google Pay, PhonePe, Paytm), RuPay and Visa/Mastercard Debit and Credit cards, and Net Banking.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-base">How do author payouts work?</h3>
              <p className="text-xs text-slate-600">
                Authors receive 85% of net sales. Whenever your available balance reaches ₹1,000, you can request a payout to your registered bank account or UPI ID from the Author Payouts dashboard.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
