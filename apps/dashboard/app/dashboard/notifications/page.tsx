"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell,
  Shield,
  UserPlus,
  AtSign,
  Mail,
  AlertTriangle,
  CheckCheck,
  Trash2,
  ExternalLink,
  Clock,
  Settings,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
};

type NotificationPref = {
  emailDigest: string;
  mention: boolean;
  comment: boolean;
  report: boolean;
  system: boolean;
  marketing: boolean;
};

const FILTER_TABS = ["All", "Unread", "Security", "System", "Admin", "Mentions"] as const;
type FilterTab = (typeof FILTER_TABS)[number];

function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  const diffWk = Math.floor(diffDay / 7);
  if (diffWk < 4) return `${diffWk}w ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function notificationIcon(type: string) {
  switch (type) {
    case "security":
      return <Shield size={16} />;
    case "admin":
      return <UserPlus size={16} />;
    case "mention":
      return <AtSign size={16} />;
    case "digest":
      return <Mail size={16} />;
    case "alert":
      return <AlertTriangle size={16} />;
    default:
      return <Bell size={16} />;
  }
}

function notificationColor(type: string): string {
  switch (type) {
    case "security":
    case "alert":
      return "var(--danger)";
    case "admin":
      return "var(--warning)";
    case "mention":
      return "#7aa2f7";
    default:
      return "var(--text-muted)";
  }
}

function notificationBg(type: string): string {
  switch (type) {
    case "security":
    case "alert":
      return "var(--danger-subtle)";
    case "admin":
      return "var(--warning-subtle)";
    default:
      return "rgba(255,255,255,0.04)";
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [toast, setToast] = useState<string | null>(null);
  const fetched = useRef(false);

  const [prefs, setPrefs] = useState<NotificationPref>({
    emailDigest: "instant",
    mention: true,
    comment: true,
    report: true,
    system: true,
    marketing: false,
  });
  const [prefsLoading, setPrefsLoading] = useState(true);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    fetch(`${API}/api/notifications?limit=50`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { notifications: [], unread: 0 }))
      .then((d) => {
        setNotifications(d.notifications || []);
        setUnread(d.unread || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch(`${API}/api/notifications/prefs`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setPrefs((p) => ({ ...p, ...d }));
      })
      .catch(() => {})
      .finally(() => setPrefsLoading(false));
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await fetch(`${API}/api/notifications`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((n) => n.map((x) => ({ ...x, read: true })));
      setUnread(0);
      showToast("All marked as read");
    } catch {
      showToast("Failed to mark all as read");
    }
  }, [showToast]);

  const markRead = useCallback(async (id: string) => {
    try {
      await fetch(`${API}/api/notifications`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: true }),
      });
      setNotifications((n) =>
        n.map((x) => (x.id === id ? { ...x, read: true } : x))
      );
      setUnread((u) => Math.max(0, u - 1));
    } catch {}
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await fetch(`${API}/api/notifications?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setNotifications((n) => {
        const target = n.find((x) => x.id === id);
        const next = n.filter((x) => x.id !== id);
        if (target && !target.read) setUnread((u) => Math.max(0, u - 1));
        return next;
      });
      showToast("Notification deleted");
    } catch {
      showToast("Failed to delete");
    }
  }, [showToast]);

  const updatePref = useCallback(
    async (key: keyof NotificationPref, value: string | boolean) => {
      const next = { ...prefs, [key]: value };
      setPrefs(next);
      try {
        await fetch(`${API}/api/notifications/prefs`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(next),
        });
        showToast("Preferences saved");
      } catch {
        showToast("Failed to save preferences");
      }
    },
    [prefs, showToast]
  );

  const filtered = notifications.filter((n) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Unread") return !n.read;
    if (activeFilter === "Security") return n.type === "security" || n.type === "alert";
    if (activeFilter === "System") return n.type === "system" || n.type === "digest";
    if (activeFilter === "Admin") return n.type === "admin";
    if (activeFilter === "Mentions") return n.type === "mention";
    return true;
  });

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>
          <h1>Notifications</h1>
        </div>
        <div className="glass">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="table-row" style={{ padding: "14px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="skeleton" style={{ height: 13, width: "60%", marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 11, width: "40%" }} />
                </div>
              </div>
              <div className="skeleton" style={{ height: 11, width: 60, flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      {/* ── Header ── */}
      <div className="section-header" style={{ marginBottom: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1>Notifications</h1>
            {unread > 0 && (
              <span
                className="badge"
                style={{
                  background: "rgba(122,162,247,0.12)",
                  color: "#7aa2f7",
                  fontSize: 12,
                  padding: "3px 10px",
                  borderRadius: 20,
                }}
              >
                {unread} unread
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {unread > 0 && (
              <button
                className="btn btn-ghost"
                onClick={markAllRead}
                style={{ height: 32, fontSize: 12, padding: "0 12px" }}
              >
                <CheckCheck size={13} />
                Mark all read
              </button>
            )}
            <a
              href="/dashboard/notifications/settings"
              className="btn btn-ghost"
              style={{ height: 32, fontSize: 12, padding: "0 12px", textDecoration: "none" }}
            >
              <Settings size={13} />
              Settings
            </a>
          </div>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab;
          const count =
            tab === "Unread"
              ? notifications.filter((n) => !n.read).length
              : tab === "Security"
                ? notifications.filter((n) => n.type === "security" || n.type === "alert").length
                : tab === "System"
                  ? notifications.filter((n) => n.type === "system" || n.type === "digest").length
                  : tab === "Admin"
                    ? notifications.filter((n) => n.type === "admin").length
                    : tab === "Mentions"
                      ? notifications.filter((n) => n.type === "mention").length
                      : notifications.length;
          return (
            <button
              key={tab}
              className="btn"
              onClick={() => setActiveFilter(tab)}
              style={{
                height: 30,
                fontSize: 12,
                padding: "0 12px",
                background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                color: isActive ? "#f4f4f6" : "var(--text-muted)",
                border: isActive ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
                fontWeight: isActive ? 600 : 500,
              }}
            >
              {tab}
              {count > 0 && (
                <span
                  style={{
                    fontSize: 10,
                    padding: "1px 6px",
                    borderRadius: 10,
                    background: isActive ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
                    color: isActive ? "var(--text)" : "var(--text-ash)",
                    fontWeight: 500,
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Notifications List ── */}
      {filtered.length === 0 ? (
        <div className="glass" style={{ padding: 60, textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "rgba(255,255,255,0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Bell size={24} style={{ color: "var(--text-ash)" }} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
            No notifications yet
          </p>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            You'll see alerts about your account here
          </p>
        </div>
      ) : (
        <div className="glass" style={{ padding: "4px 0" }}>
          {filtered.map((n) => (
            <div
              key={n.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 18px",
                borderBottom: "1px solid var(--border)",
                opacity: n.read ? 0.55 : 1,
                transition: "opacity 0.15s ease",
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: notificationBg(n.type),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  color: notificationColor(n.type),
                }}
              >
                {notificationIcon(n.type)}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{n.title}</p>
                  {!n.read && (
                    <div
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "#7aa2f7",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
                {n.body && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      marginTop: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {n.body}
                  </p>
                )}
              </div>

              {/* Time */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  flexShrink: 0,
                  color: "var(--text-ash)",
                  fontSize: 11,
                }}
              >
                <Clock size={11} />
                {relativeTime(n.createdAt)}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                {!n.read && (
                  <button
                    onClick={() => markRead(n.id)}
                    title="Mark as read"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      border: "none",
                      background: "transparent",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.12s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                      e.currentTarget.style.color = "var(--text)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--text-muted)";
                    }}
                  >
                    <CheckCheck size={13} />
                  </button>
                )}
                {n.link && (
                  <a
                    href={n.link}
                    title="View"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--text-muted)",
                      textDecoration: "none",
                      transition: "all 0.12s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                      e.currentTarget.style.color = "var(--text)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--text-muted)";
                    }}
                  >
                    <ExternalLink size={13} />
                  </a>
                )}
                <button
                  onClick={() => deleteNotification(n.id)}
                  title="Delete"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    border: "none",
                    background: "transparent",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.12s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--danger-subtle)";
                    e.currentTarget.style.color = "var(--danger)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--text-muted)";
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Notification Preferences ── */}
      <div className="glass">
        <div className="card-section">
          <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Settings size={15} style={{ color: "var(--text-muted)" }} />
            Notification Preferences
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {/* Toggle rows */}
            {([
              { key: "system" as const, label: "System updates", desc: "Platform changes and maintenance notices" },
              { key: "mention" as const, label: "Mentions", desc: "When someone mentions you in a conversation" },
              { key: "comment" as const, label: "Comment replies", desc: "Replies to your comments and posts" },
              { key: "report" as const, label: "Security alerts", desc: "Sign-in attempts, password changes, and suspicious activity" },
              { key: "marketing" as const, label: "Marketing", desc: "Product updates and feature announcements" },
            ] as const).map((item, idx) => (
              <div
                key={item.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 0",
                  borderBottom: idx < 4 ? "1px solid var(--border)" : "none",
                }}
              >
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{item.label}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{item.desc}</p>
                </div>
                <button
                  className={`toggle ${prefs[item.key] ? "active" : ""}`}
                  onClick={() => updatePref(item.key, !prefs[item.key])}
                  aria-label={`Toggle ${item.label}`}
                />
              </div>
            ))}

            {/* Frequency select */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 0",
              }}
            >
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>Email digest frequency</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                  How often you receive email summaries
                </p>
              </div>
              <select
                className="input-field"
                style={{ width: 140, height: 34, fontSize: 12 }}
                value={prefs.emailDigest}
                onChange={(e) => updatePref("emailDigest", e.target.value)}
              >
                <option value="instant">Instant</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="off">Off</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {toast && <div className="toast toast-success">{toast}</div>}
    </div>
  );
}
