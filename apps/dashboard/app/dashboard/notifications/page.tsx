"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Notification = {
  id: string; type: string; title: string; body: string | null;
  read: boolean; createdAt: string; link: string | null;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(`${API}/api/notifications?limit=50`, { credentials: "include" })
      .then(r => r.ok ? r.json() : { notifications: [], unread: 0 })
      .then(d => { setNotifications(d.notifications || []); setUnread(d.unread || 0); })
      .catch(() => {});
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await fetch(`${API}/api/notifications`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications(n => n.map(x => ({ ...x, read: true })));
      setUnread(0);
      setToast("All marked as read");
    } catch { setToast("Failed"); }
    setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>Notifications</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            {unread > 0 ? `${unread} unread` : "All caught up"}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn btn-secondary">
            <CheckCheck size={14} />Mark all read
          </button>
        )}
      </div>

      <div className="glass" style={{ padding: "4px 0" }}>
        {notifications.length === 0 ? (
          <div className="card-section text-center">
            <Bell size={32} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No notifications yet</p>
          </div>
        ) : notifications.map(n => (
          <div key={n.id} className="table-row" style={{ padding: "14px 20px", opacity: n.read ? 0.6 : 1 }}>
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.read ? "transparent" : "var(--accent)", flexShrink: 0 }} />
              <div className="min-w-0">
                <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{n.title}</p>
                {n.body && <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>{n.body}</p>}
              </div>
            </div>
            <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>{new Date(n.createdAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>

      {toast && <div className="toast toast-success">{toast}</div>}
    </div>
  );
}
