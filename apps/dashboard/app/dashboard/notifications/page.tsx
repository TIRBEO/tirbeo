"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { NotificationsSkeleton } from "../../components/Skeleton";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Notification = {
  id: string; type: string; title: string; body: string | null;
  read: boolean; createdAt: string; link: string | null;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(`${API}/api/notifications?limit=50`, { credentials: "include" })
      .then(r => r.ok ? r.json() : { notifications: [], unread: 0 })
      .then(d => { setNotifications(d.notifications || []); setUnread(d.unread || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
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

  if (loading) return <NotificationsSkeleton />;

  return (
    <div className="space-y-8">
      <div className="section-header flex items-center justify-between" style={{ marginBottom: 0 }}>
        <div>
          <h1>Notifications</h1>
          <p>{unread > 0 ? `${unread} unread` : "All caught up"}</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn btn-secondary" style={{ height: 32, fontSize: 12 }}>
            <CheckCheck size={13} /> Mark all read
          </button>
        )}
      </div>

      <div className="glass" style={{ padding: "4px 0" }}>
        {notifications.length === 0 ? (
          <div className="card-section text-center">
            <Bell size={28} style={{ color: "var(--text-muted)", margin: "0 auto 10px" }} />
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No notifications yet</p>
          </div>
        ) : notifications.map(n => (
          <div key={n.id} className="table-row" style={{ padding: "12px 18px", opacity: n.read ? 0.5 : 1 }}>
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: n.read ? "transparent" : "#ffffff", flexShrink: 0 }} />
              <div className="min-w-0">
                <p style={{ fontSize: 13, fontWeight: 500, color: "#ffffff" }}>{n.title}</p>
                {n.body && <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }} className="truncate">{n.body}</p>}
              </div>
            </div>
            <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>{new Date(n.createdAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>

      {toast && <div className="toast toast-success">{toast}</div>}
    </div>
  );
}
