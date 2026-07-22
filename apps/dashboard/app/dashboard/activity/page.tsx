"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Activity, Shield, User, Settings, Bell, LogIn, LogOut, Key, Trash2,
  Edit3, Eye, Globe, Smartphone, AlertTriangle, CheckCircle2, Filter,
} from "lucide-react";
import { ActivitySkeleton } from "../../components/Skeleton";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type AuditEvent = {
  id: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  severity: string;
  createdAt: string;
  actor?: { name?: string; email?: string; photoUrl?: string } | null;
};

const ACTION_CONFIG: Record<string, { icon: typeof Activity; color: string; label: string }> = {
  "user.login": { icon: LogIn, color: "#59d499", label: "Signed in" },
  "user.logout": { icon: LogOut, color: "var(--text-muted)", label: "Signed out" },
  "user.signup": { icon: User, color: "#57c1ff", label: "Account created" },
  "user.deleted": { icon: Trash2, color: "#ff6161", label: "Account deleted" },
  "user.updated": { icon: Edit3, color: "var(--text-secondary)", label: "Profile updated" },
  "user.banned": { icon: AlertTriangle, color: "#ff6161", label: "Account banned" },
  "user.unbanned": { icon: CheckCircle2, color: "#59d499", label: "Account unbanned" },
  "password.changed": { icon: Key, color: "#ffc533", label: "Password changed" },
  "2fa.enabled": { icon: Shield, color: "#59d499", label: "2FA enabled" },
  "2fa.disabled": { icon: Shield, color: "#ff6161", label: "2FA disabled" },
  "session.revoked": { icon: LogOut, color: "#ffc533", label: "Session revoked" },
  "role.created": { icon: User, color: "#57c1ff", label: "Role created" },
  "role.updated": { icon: Edit3, color: "var(--text-secondary)", label: "Role updated" },
  "role.deleted": { icon: Trash2, color: "#ff6161", label: "Role deleted" },
  "settings.updated": { icon: Settings, color: "var(--text-secondary)", label: "Settings changed" },
  "notification.sent": { icon: Bell, color: "#57c1ff", label: "Notification sent" },
  "integration.connected": { icon: Globe, color: "#59d499", label: "Integration connected" },
  "integration.disconnected": { icon: Globe, color: "#ff6161", label: "Integration disconnected" },
  "workspace.created": { icon: Activity, color: "#57c1ff", label: "Workspace created" },
  "workspace.deleted": { icon: Trash2, color: "#ff6161", label: "Workspace deleted" },
  "backup_codes.generated": { icon: Key, color: "#ffc533", label: "Backup codes generated" },
  "recovery_email.updated": { icon: Bell, color: "var(--text-secondary)", label: "Recovery email updated" },
  "recovery_phone.updated": { icon: Smartphone, color: "var(--text-secondary)", label: "Recovery phone updated" },
  "passkey.added": { icon: Eye, color: "#59d499", label: "Passkey added" },
  "passkey.removed": { icon: Eye, color: "#ff6161", label: "Passkey removed" },
};

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "Just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const FILTERS = ["All", "Security", "Account", "System", "Admin"];

export default function ActivityPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(`${API}/api/user/activity?limit=100`, { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredEvents = useMemo(() => {
    if (filter === "All") return events;
    return events.filter(e => {
      const action = e.action.toLowerCase();
      if (filter === "Security") return action.includes("2fa") || action.includes("password") || action.includes("session") || action.includes("passkey") || action.includes("recovery") || action.includes("backup");
      if (filter === "Account") return action.includes("user.") || action.includes("profile");
      if (filter === "System") return action.includes("settings") || action.includes("notification") || action.includes("workspace") || action.includes("integration");
      if (filter === "Admin") return action.includes("role") || action.includes("banned") || action.includes("seed");
      return true;
    });
  }, [events, filter]);

  const groupedEvents = useMemo(() => {
    const groups: { date: string; events: AuditEvent[] }[] = [];
    let currentDate = "";
    filteredEvents.forEach(e => {
      const d = new Date(e.createdAt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
      if (d !== currentDate) {
        currentDate = d;
        groups.push({ date: d, events: [] });
      }
      groups[groups.length - 1].events.push(e);
    });
    return groups;
  }, [filteredEvents]);

  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { All: events.length, Security: 0, Account: 0, System: 0, Admin: 0 };
    events.forEach(e => {
      const a = e.action.toLowerCase();
      if (a.includes("2fa") || a.includes("password") || a.includes("session") || a.includes("passkey")) counts.Security++;
      if (a.includes("user.") || a.includes("profile")) counts.Account++;
      if (a.includes("settings") || a.includes("notification") || a.includes("workspace")) counts.System++;
      if (a.includes("role") || a.includes("banned")) counts.Admin++;
    });
    return counts;
  }, [events]);

  if (loading) return <ActivitySkeleton />;

  return (
    <div className="space-y-6">
      <div className="section-header">
        <h1>Activity</h1>
        <p>Complete audit trail of everything that happened on your account</p>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Total Events", value: events.length, icon: Activity },
          { label: "Security Events", value: filterCounts.Security, icon: Shield },
          { label: "Account Changes", value: filterCounts.Account, icon: User },
          { label: "System Events", value: filterCounts.System, icon: Settings },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={12} style={{ color: "var(--text-muted)" }} />
              <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>{s.label}</span>
            </div>
            <p style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filter-tabs">
        {FILTERS.map(f => (
          <button key={f} className={`filter-tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f}
            <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.6 }}>{filterCounts[f] || 0}</span>
          </button>
        ))}
      </div>

      {/* Timeline */}
      {groupedEvents.length === 0 ? (
        <div className="empty-state">
          <Activity size={32} style={{ color: "var(--text-ash)", marginBottom: 12 }} />
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>No activity found</p>
          <p style={{ fontSize: 12, color: "var(--text-ash)", marginTop: 4 }}>Events will appear as you use Tirbeo</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedEvents.map(group => (
            <div key={group.date}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 12, paddingLeft: 4 }}>{group.date}</p>
              <div className="glass" style={{ overflow: "hidden" }}>
                {group.events.map(event => {
                  const config = ACTION_CONFIG[event.action] || { icon: Activity, color: "var(--text-muted)", label: event.action };
                  const Icon = config.icon;
                  return (
                    <div key={event.id} className="notification-row" style={{ borderBottom: "1px solid var(--border)" }}>
                      <div className="timeline-dot" style={{ background: `${config.color}20`, position: "relative", left: 0, top: 0, flexShrink: 0 }}>
                        <Icon size={10} style={{ color: config.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontSize: 13, color: "var(--text)" }}>{config.label}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span style={{ fontSize: 11, color: "var(--text-ash)" }}>{relativeTime(event.createdAt)}</span>
                          {event.metadata?.ip && <span style={{ fontSize: 11, color: "var(--text-ash)" }}>IP: {String(event.metadata.ip)}</span>}
                          {event.metadata?.device && <span style={{ fontSize: 11, color: "var(--text-ash)" }}>{String(event.metadata.device)}</span>}
                          {event.metadata?.location && <span style={{ fontSize: 11, color: "var(--text-ash)" }}>{String(event.metadata.location)}</span>}
                        </div>
                      </div>
                      <span className={`badge ${event.severity === "warning" ? "badge-danger" : event.severity === "critical" ? "badge-danger" : "badge-default"}`} style={{ fontSize: 10 }}>
                        {event.severity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
