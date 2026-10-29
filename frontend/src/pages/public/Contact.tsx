import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const Contact: React.FC = () => {
  const { success } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    success('Message sent! Our support team will reply within 24 hours.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Contact eBookHub Support</h1>
        <p className="text-sm text-slate-500">
          Have questions regarding an order, reader compatibility, author applications, or institutional partnerships? Reach out to us.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Form (Matching Screen 7) */}
        <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Send us a Message</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Full Name</label>
              <input
                type="text"
                required
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-brand-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-brand-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Subject</label>
              <input
                type="text"
                required
                placeholder="How can we assist you?"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-brand-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Message</label>
              <textarea
                rows={4}
                required
                placeholder="Describe your inquiry in detail..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-brand-500 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </button>
          </form>
        </div>

        {/* Contact Information Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Direct Email Support</p>
              <p className="text-xs text-slate-500 mt-0.5">help@ebookhub.com</p>
              <p className="text-xs text-slate-500">authors@ebookhub.com</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Customer Helpline</p>
              <p className="text-xs text-slate-500 mt-0.5">+91 98765 43210 (Mon-Sat, 9 AM - 7 PM IST)</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Registered Operations</p>
              <p className="text-xs text-slate-500 mt-0.5">
                eBookHub Technologies India Pvt Ltd<br />
                Indiranagar, Bangalore, Karnataka 560038
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
