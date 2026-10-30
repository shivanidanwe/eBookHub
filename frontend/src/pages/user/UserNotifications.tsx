import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Clock, ArrowRight, Check } from 'lucide-react';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

export const UserNotifications: React.FC = () => {
  const { success } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadNotifications() {
    try {
      setIsLoading(true);
      const res = await api.get<any>('/notifications');
      if (res.success && Array.isArray(res.data)) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      success('Notification marked as read.');
    } catch (e) {}
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      success('All notifications marked as read.');
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-xs text-slate-500 mt-0.5">Stay updated with purchase receipts, book updates, and platform alerts.</p>
        </div>
        <button
          onClick={markAllRead}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 transition"
        >
          Mark all as read
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-500">
          No notifications to display.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition flex items-start gap-3.5 ${
                n.isRead ? 'bg-white border-slate-200/80 text-slate-700' : 'bg-blue-50/50 border-blue-200 text-slate-900 shadow-xs'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${n.isRead ? 'bg-slate-100 text-slate-500' : 'bg-blue-100 text-blue-600'}`}>
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-xs">{n.title}</p>
                  <span className="text-[10px] text-slate-400">{formatDate(n.createdAt)}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                <div className="flex items-center gap-3 pt-1">
                  {n.link && (
                    <Link to={n.link} className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline">
                      <span>View details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                  {!n.isRead && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                    >
                      <Check className="w-3 h-3" />
                      <span>Mark as Read</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
