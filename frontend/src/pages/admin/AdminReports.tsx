import React, { useState, useEffect } from 'react';
import { BarChart3, Download, FileText, Calendar, Filter, CheckCircle2, TrendingUp } from 'lucide-react';
import { api } from '../../lib/api';
import { formatINR, formatDate } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';

export default function AdminReports() {
  const { success, error } = useToast();
  const [reportType, setReportType] = useState<'orders' | 'books' | 'transactions'>('orders');
  const [isExporting, setIsExporting] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get<any>('/admin/dashboard');
        if (res.success && res.data) {
          setDashboardData(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const res = await api.get<any>(`/admin/reports/export?type=${reportType}`);
      if (res.success && Array.isArray(res.data)) {
        const data = res.data;
        if (data.length === 0) {
          error('No data records available to export for this report type.');
          return;
        }

        // Generate CSV content
        let csvContent = '';
        if (reportType === 'orders') {
          csvContent = 'Order ID,Customer Email,Total Amount (INR),Status,Date\n' +
            data.map((o) => `"${o.orderNumber}","${o.user?.email || ''}","${(o.totalAmount / 100).toFixed(2)}","${o.status}","${o.createdAt}"`).join('\n');
        } else if (reportType === 'books') {
          csvContent = 'Book Title,Author,Category,Price (INR),Status,Rating\n' +
            data.map((b) => `"${b.title.replace(/"/g, '""')}","${b.author?.fullName || ''}","${b.category?.name || ''}","${(b.price / 100).toFixed(2)}","${b.status}","${b.averageRating}"`).join('\n');
        } else {
          csvContent = 'Transaction ID,Order ID,Amount (INR),Status,Date\n' +
            data.map((t) => `"${t.providerPaymentId || t.id}","${t.order?.orderNumber || ''}","${(t.amount / 100).toFixed(2)}","${t.status}","${t.createdAt}"`).join('\n');
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `eBookHub-${reportType}-report-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        success(`${reportType.toUpperCase()} report exported successfully as CSV.`);
      }
    } catch (err: any) {
      error(err.message || 'Failed to generate report export');
    } finally {
      setIsExporting(false);
    }
  };

  const metrics = dashboardData?.metrics || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-purple-600" />
            <span>Platform Reports & Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail exports, transaction logs, catalog health, and sales performance reports.
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? 'Exporting...' : 'Export Filtered Report (CSV)'}</span>
        </button>
      </div>

      {/* Summary Telemetry */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Users</span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{metrics.totalUsers || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Books</span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{metrics.totalBooks || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Orders</span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{metrics.totalOrders || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Gross Spend</span>
          <p className="text-xl font-extrabold text-purple-700 mt-1">{formatINR(metrics.totalRevenue || 0)}</p>
        </div>
      </div>

      {/* Report Configuration Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">Select Report Type</h2>
          <p className="text-xs text-slate-500">Choose the dataset to export for administrative audit</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setReportType('orders')}
            className={`p-4 rounded-2xl border text-left transition space-y-1 ${
              reportType === 'orders'
                ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="font-bold text-xs text-slate-900 block">Orders & Purchases</span>
            <span className="text-[11px] text-slate-500 leading-relaxed block">
              Complete student order history, order numbers, pricing, and settlement status.
            </span>
          </button>

          <button
            type="button"
            onClick={() => setReportType('books')}
            className={`p-4 rounded-2xl border text-left transition space-y-1 ${
              reportType === 'books'
                ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="font-bold text-xs text-slate-900 block">Books Catalog Inventory</span>
            <span className="text-[11px] text-slate-500 leading-relaxed block">
              Global catalog of titles, publication moderation states, authors, and prices.
            </span>
          </button>

          <button
            type="button"
            onClick={() => setReportType('transactions')}
            className={`p-4 rounded-2xl border text-left transition space-y-1 ${
              reportType === 'transactions'
                ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="font-bold text-xs text-slate-900 block">Gateway Transactions</span>
            <span className="text-[11px] text-slate-500 leading-relaxed block">
              Inbound payment gateway references, provider verification, and receipts.
            </span>
          </button>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Export format: <strong>Comma-Separated Values (.CSV)</strong>, UTF-8 compliant
          </span>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating CSV...' : 'Download Export Report'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
