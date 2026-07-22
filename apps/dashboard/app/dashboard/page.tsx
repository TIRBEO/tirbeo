"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  User, Shield, Bell, Clock, Zap, Settings, Activity, ArrowUpRight,
  CheckCircle2, XCircle, MapPin, Globe, TrendingUp, Eye, Calendar,
} from "lucide-react";
import { HomeSkeleton } from "../components/Skeleton";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Me = {
  id: string; email: string; name: string | null; photoUrl: string | null;
  occupation: string | null; adminRole: string | null;
  createdAt: string; emailVerified: boolean; phoneVerified: boolean;
  is2FAEnabled: boolean; bio: string | null; secondaryEmail: string | null;
  language: string | null; country: string | null; theme: string | null;
  lastActiveAt?: string;
};

type ActivityLog = { id: string; action: string; createdAt: string; metadata?: Record<string, unknown> };
type Session = { id: string; createdAt: string; userAgent?: string; ipAddress?: string };

function RingProgress({ pct, size = 80, stroke = 6 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="ring-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)" }} />
      </svg>
      <div className="ring-progress-label">{pct}%</div>
    </div>
  );
}

function ActivityChart({ activity }: { activity: ActivityLog[] }) {
  const hourlyData = useMemo(() => {
    const hours = new Array(24).fill(0);
    activity.forEach(a => {
      const h = new Date(a.createdAt).getHours();
      hours[h]++;
    });
    const max = Math.max(...hours, 1);
    return hours.map((count, i) => ({ hour: i, count, pct: (count / max) * 100 }));
  }, [activity]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>Activity (24h)</span>
        <span style={{ fontSize: 11, color: "var(--text-ash)" }}>{activity.length} events</span>
      </div>
      <div className="chart-bar">
        {hourlyData.map(d => (
          <div key={d.hour} className={`chart-bar-segment ${d.count > 0 ? "active" : ""}`}
            style={{ height: `${Math.max(d.pct, 4)}%` }}
            title={`${d.hour}:00 — ${d.count} events`} />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span style={{ fontSize: 9, color: "var(--text-ash)" }}>12am</span>
        <span style={{ fontSize: 9, color: "var(--text-ash)" }}>6am</span>
        <span style={{ fontSize: 9, color: "var(--text-ash)" }}>12pm</span>
        <span style={{ fontSize: 9, color: "var(--text-ash)" }}>6pm</span>
        <span style={{ fontSize: 9, color: "var(--text-ash)" }}>Now</span>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const [user, setUser] = useState<Me | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastLoginInfo, setLastLoginInfo] = useState<{ location?: string; ip?: string; device?: string } | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(`${API}/api/profile`, { credentials: "include" }).then(r => r.ok ? r.json() : null).then(setUser).catch(() => {});
    fetch(`${API}/api/user/activity?limit=50`, { credentials: "include" }).then(r => r.ok ? r.json() : []).then(setActivity).catch(() => {});
    fetch(`${API}/api/security/sessions`, { credentials: "include" }).then(r => r.ok ? r.json() : null).then(d => { if (d?.sessions) setSessions(d.sessions); }).catch(() => {});
    fetch(`${API}/api/user/last-login`, { credentials: "include" }).then(r => r.ok ? r.json() : null).then(setLastLoginInfo).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading || !user) return <HomeSkeleton />;

  const initials = user.name ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : user.email[0].toUpperCase();
  const checks = [
    { label: "Name set", ok: !!user.name },
    { label: "Email verified", ok: user.emailVerified },
    { label: "2FA enabled", ok: user.is2FAEnabled },
    { label: "Secondary email", ok: !!user.secondaryEmail },
    { label: "Country set", ok: !!user.country },
    { label: "Phone verified", ok: user.phoneVerified },
    { label: "Occupation set", ok: !!user.occupation },
    { label: "Bio added", ok: !!user.bio },
  ];
  const completedChecks = checks.filter(c => c.ok).length;
  const completionPct = Math.round((completedChecks / checks.length) * 100);
  const memberMonths = Math.floor((new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30));
  const isOnline = user.lastActiveAt ? (new Date().getTime() - new Date(user.lastActiveAt).getTime()) < 300000 : false;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass" style={{ padding: "28px 32px" }}>
        <div className="flex items-start gap-5">
          <div className="avatar" style={{ width: 64, height: 64, fontSize: 22, borderRadius: 16, flexShrink: 0 }}>
            {user.photoUrl ? <img src={user.photoUrl} alt="" /> : initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.03em", lineHeight: 1.2 }}>
              {getGreeting()}, {user.name?.split(" ")[0] || "there"}!
            </h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="badge badge-default" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: isOnline ? "#59d499" : "rgba(255,255,255,0.2)" }} />
                {isOnline ? "Online" : "Offline"}
              </span>
              {user.occupation && <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{user.occupation}</span>}
              {user.country && <span style={{ fontSize: 13, color: "var(--text-muted)" }}>· {user.country}</span>}
              {user.language && <span style={{ fontSize: 13, color: "var(--text-muted)" }}>· {user.language.toUpperCase()}</span>}
            </div>
            <p style={{ fontSize: 12, color: "var(--text-ash)", marginTop: 6 }}>{user.email}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/profile" className="btn btn-primary"><User size={14} /> Edit Profile</Link>
            <Link href="/dashboard/security" className="btn btn-ghost"><Shield size={14} /> Security</Link>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>Profile</span>
            <RingProgress pct={completionPct} size={44} stroke={4} />
          </div>
          <p style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em" }}>{completionPct}%</p>
          <p style={{ fontSize: 11, color: "var(--text-ash)", marginTop: 2 }}>{completedChecks}/{checks.length} complete</p>
          <div className="progress-bar" style={{ marginTop: 10 }}>
            <div className="progress-bar-fill" style={{ width: `${completionPct}%` }} />
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={12} style={{ color: "var(--text-muted)" }} />
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>Security</span>
          </div>
          <p style={{ fontSize: 24, fontWeight: 700, color: user.is2FAEnabled ? "#59d499" : "#ff6161", letterSpacing: "-0.03em" }}>
            {user.is2FAEnabled ? "Strong" : "Weak"}
          </p>
          <p style={{ fontSize: 11, color: "var(--text-ash)", marginTop: 2 }}>
            {user.is2FAEnabled ? "2FA is active" : "Enable 2FA for protection"}
          </p>
          {!user.is2FAEnabled && (
            <Link href="/dashboard/security" style={{ fontSize: 11, color: "#fff", textDecoration: "none", marginTop: 8, display: "inline-block" }}>
              Enable now →
            </Link>
          )}
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={12} style={{ color: "var(--text-muted)" }} />
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>Member</span>
          </div>
          <p style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em" }}>
            {memberMonths < 1 ? "New" : `${memberMonths} mo`}
          </p>
          <p style={{ fontSize: 11, color: "var(--text-ash)", marginTop: 2 }}>
            Since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={12} style={{ color: "var(--text-muted)" }} />
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>Activity</span>
          </div>
          <p style={{ fontSize: 24, fontWeight: 700, color: activity.length > 0 ? "#57c1ff" : "#9c9c9d", letterSpacing: "-0.03em" }}>
            {activity.length}
          </p>
          <p style={{ fontSize: 11, color: "var(--text-ash)", marginTop: 2 }}>
            {activity.length > 0 ? "Events this session" : "No activity yet"}
          </p>
        </div>
      </div>

      {/* Last Login */}
      {lastLoginInfo && (
        <div className="glass-subtle" style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: 10, borderRadius: 10 }}>
          <MapPin size={13} style={{ color: "var(--text-muted)" }} />
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Last login from <span style={{ color: "var(--text-secondary)" }}>{lastLoginInfo.ip}</span>
            {lastLoginInfo.location && <span> ({lastLoginInfo.location})</span>}
            {lastLoginInfo.device && <span> on {lastLoginInfo.device}</span>}
          </span>
        </div>
      )}

      {/* Activity + Account Status */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="glass" style={{ padding: "24px 28px" }}>
          <ActivityChart activity={activity} />
        </div>

        <div className="glass" style={{ padding: "24px 28px" }}>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={14} style={{ color: "var(--text-muted)" }} />
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Account Status</h3>
          </div>
          <div className="space-y-2">
            {checks.map(c => (
              <div key={c.label} className="flex items-center justify-between" style={{ padding: "6px 0" }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{c.label}</span>
                {c.ok ? (
                  <CheckCircle2 size={13} style={{ color: "rgba(255,255,255,0.6)" }} />
                ) : (
                  <XCircle size={13} style={{ color: "var(--text-ash)" }} />
                )}
              </div>
            ))}
          </div>
          {completionPct < 100 && (
            <Link href="/dashboard/profile" style={{ fontSize: 12, color: "#fff", textDecoration: "none", marginTop: 14, display: "inline-block", fontWeight: 500 }}>
              Complete your profile →
            </Link>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Profile", desc: "Personal info & bio", href: "/dashboard/profile", icon: User },
          { label: "Security", desc: "Password, 2FA & sessions", href: "/dashboard/security", icon: Shield },
          { label: "Notifications", desc: "Alerts & preferences", href: "/dashboard/notifications", icon: Bell },
          { label: "Preferences", desc: "Theme, font & layout", href: "/dashboard/preferences", icon: Settings },
        ].map(q => (
          <Link key={q.href} href={q.href} className="glass-subtle group" style={{ padding: "16px 18px", display: "block", textDecoration: "none", transition: "all 0.15s", borderRadius: 12 }}>
            <div className="flex items-center justify-between mb-2">
              <q.icon size={18} style={{ color: "var(--text-secondary)" }} />
              <ArrowUpRight size={13} style={{ color: "var(--text-ash)" }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{q.label}</p>
            <p style={{ fontSize: 11, color: "var(--text-ash)", marginTop: 3 }}>{q.desc}</p>
          </Link>
        ))}
      </div>

      {/* Active Sessions Preview */}
      {sessions.length > 0 && (
        <div className="glass" style={{ padding: "20px 24px" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Smartphone size={13} style={{ color: "var(--text-muted)" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Active Sessions</span>
            </div>
            <Link href="/dashboard/security" style={{ fontSize: 11, color: "var(--text-muted)", textDecoration: "none" }}>View all →</Link>
          </div>
          <div>
            {sessions.slice(0, 3).map(s => (
              <div key={s.id} className="device-card" style={{ padding: "10px 0" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Smartphone size={14} style={{ color: "var(--text-muted)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>{s.userAgent?.split(" ").slice(0, 2).join(" ") || "Unknown device"}</p>
                  <p style={{ fontSize: 11, color: "var(--text-ash)" }}>{s.ipAddress || "Unknown IP"} · {new Date(s.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="glass-subtle" style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 10, borderRadius: 10 }}>
        <Globe size={13} style={{ color: "var(--text-ash)" }} />
        <p style={{ fontSize: 12, color: "var(--text-ash)" }}>
          Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          {user.country ? ` · ${user.country}` : ""}
          {user.language ? ` · ${user.language.toUpperCase()}` : ""}
          {user.adminRole ? ` · ${user.adminRole.replace("_", " ")}` : ""}
        </p>
      </div>
    </div>
  );
}
