import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TopAppBar } from '../components/common/TopAppBar';
import { BottomNav } from '../components/common/BottomNav';
import { Button } from '../components/common/Button';
import { notificationService } from '../services';
import { useAuth } from '../context/AuthContext';

const NOTIFICATION_CATEGORIES = [
  { id: 'all', label: 'All Alerts', icon: 'notifications' },
  { id: 'sos_alert', label: 'Urgent SOS', icon: 'emergency' },
  { id: 'availability', label: 'Availability', icon: 'check_circle' },
  { id: 'requests', label: 'Requests', icon: 'handshake' },
  { id: 'listings', label: 'Listings', icon: 'storefront' },
  { id: 'rentals', label: 'Rentals', icon: 'timer' },
  { id: 'system', label: 'System & Escrow', icon: 'shield' }
];

export function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(user?.id || 'user-001');
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    const updated = await notificationService.markAllAsRead(user?.id || 'user-001');
    setNotifications(updated);
  };

  const handleMarkAsRead = async (id) => {
    const updated = await notificationService.markAsRead(id, user?.id || 'user-001');
    setNotifications(updated);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (selectedCategory === 'all') return true;
    return n.type === selectedCategory || (selectedCategory === 'rentals' && n.type === 'rental_update');
  });

  const getCategoryIcon = (type) => {
    switch (type) {
      case 'availability':
        return { icon: 'check_circle', color: 'bg-emerald-100 text-emerald-700' };
      case 'requests':
        return { icon: 'handshake', color: 'bg-primary/15 text-primary' };
      case 'rentals':
      case 'rental_update':
        return { icon: 'timer', color: 'bg-amber-100 text-amber-700' };
      case 'listings':
        return { icon: 'storefront', color: 'bg-secondary/15 text-secondary' };
      case 'system':
      default:
        return { icon: 'shield', color: 'bg-surface-container-high text-on-surface' };
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      <TopAppBar showBack={true} />

      <main className="flex-1 w-full max-w-3xl mx-auto p-margin-mobile flex flex-col gap-lg pb-32">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="font-heading-xl text-[24px] font-extrabold text-on-surface">
              Notification Center
            </h2>
            <span className="text-body-sm text-on-surface-variant">
              Campus hardware alerts, rental returns, and availability notifications
            </span>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="text-[12px] font-bold text-primary hover:underline cursor-pointer"
          >
            Mark all read
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {NOTIFICATION_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-label-md font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-outline-variant/30'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="p-8 text-center text-on-surface-variant font-medium">
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-surface-container rounded-[24px] p-10 text-center border border-outline-variant/30 flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-[44px] text-outline">notifications_off</span>
            <span className="font-heading-lg text-[16px] font-bold text-on-surface">
              No notifications in this category
            </span>
            <span className="text-body-sm text-on-surface-variant max-w-xs">
              When equipment becomes available or your peer requests are updated, alerts will appear here.
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredNotifications.map((notif) => {
              const meta = getCategoryIcon(notif.type);
              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    handleMarkAsRead(notif.id);
                    if (notif.linkUrl) navigate(notif.linkUrl);
                  }}
                  className={`p-4 rounded-[20px] border transition-all flex items-start gap-3.5 cursor-pointer group ${
                    notif.isRead
                      ? 'bg-surface-container-low border-outline-variant/20 opacity-80 hover:opacity-100'
                      : 'bg-surface-container-lowest border-primary/30 shadow-xs ring-1 ring-primary/10'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      notif.priority === 'urgent' ? 'bg-error/15 text-error animate-pulse' : meta.color
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {notif.priority === 'urgent' ? 'emergency' : meta.icon}
                    </span>
                  </div>

                  <div className="flex flex-col flex-1 gap-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          {notif.type}
                        </span>
                        <h4 className="font-heading-lg text-[14px] font-bold text-on-surface group-hover:text-primary transition-colors">
                          {notif.title}
                        </h4>
                      </div>
                      {!notif.isRead && (
                        <span className="w-2.5 h-2.5 bg-primary rounded-full shrink-0" />
                      )}
                    </div>

                    <p className="text-body-sm text-on-surface-variant text-[13px] leading-relaxed">
                      {notif.message}
                    </p>

                    {notif.linkUrl && (
                      <div className="pt-1.5 flex items-center gap-1 text-[12px] font-bold text-primary">
                        <span>Open Details</span>
                        <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                          arrow_forward
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
