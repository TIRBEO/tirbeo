"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  User, Shield, Building2, Bell, ArrowRight, Clock, Zap,
  Mail, Globe, Settings, Activity, ArrowUpRight, CheckCircle2, XCircle,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Me = {
  id: string; email: string; name: string | null; photoUrl: string | null;
  occupation: string | null; adminRole: string | null;
  createdAt: string; emailVerified: boolean; phoneVerified: boolean;
  is2FAEnabled: boolean; bio: string | null; secondaryEmail: string | null;
  language: string | null; country: string | null; theme: string | null;
};

type ActivityLog = { id: string; action: string; createdAt: string };

export default function DashboardHome() {
  const [user, setUser] = useState<Me | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(`${API}/api/profile`, { credentials: "include" }).then(r => r.ok ? r.json() : null).then(setUser).catch(() => {});
    fetch(`${API}/api/user/activity?limit=5`, { credentials: "include" }).then(r => r.ok ? r.json() : []).then(setActivity).catch(() => {});
  }, []);

  if (!user) return null;

  const initials = user.name ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : user.email[0].toUpperCase();
  const checks = [
    { label: "Name set", ok: !!user.name },
    { label: "Email verified", ok: user.emailVerified },
    { label: "2FA enabled", ok: user.is2FAEnabled },
    { label: "Secondary email", ok: !!user.secondaryEmail },
    { label: "Country set", ok: !!user.country },
  ];
  const pct = Math.round((checks.filter(c => c.ok).length / checks.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="avatar" style={{ width: 56, height: 56, fontSize: 20, border: "2px solid rgba(255,255,255,0.08)" }}>
          {user.photoUrl ? <img src={user.photoUrl} alt="" /> : initials}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold" style={{ color: "#F2EEE8" }}>{user.name || "Welcome"}</h1>
          <p className="text-sm mt-0.5" style={{ color: "#B7C6BE" }}>
            {user.occupation || "Member"}
          </p>
        </div>
        <Link href="/dashboard/profile" className="btn btn-ghost" style={{ fontSize: 13 }}>
          <User size={14} /> Edit Profile <ArrowUpRight size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Completion", value: `${pct}%`, icon: Zap, color: "#F2EEE8" },
          { label: "2FA", value: user.is2FAEnabled ? "Active" : "Off", icon: Shield, color: user.is2FAEnabled ? "#59C173" : "#E45D5D" },
        ].map((s) => (
          <div key={s.label} className="glass" style={{ padding: "16px 18px" }}>
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={14} style={{ color: "#6b8a7a" }} />
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "#6b8a7a" }}>{s.label}</span>
            </div>
            <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="glass" style={{ padding: "20px 24px" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={16} style={{ color: "#6b8a7a" }} />
            <h3 className="text-sm font-semibold" style={{ color: "#F2EEE8" }}>Quick Actions</h3>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Profile", desc: "Edit your info", href: "/dashboard/profile", icon: User },
            { label: "Security", desc: "Password & 2FA", href: "/dashboard/security", icon: Shield },
            { label: "Notifications", desc: "Manage alerts", href: "/dashboard/notifications", icon: Bell },
            { label: "Integrations", desc: "Connect services", href: "/dashboard/integrations", icon: Settings },
          ].map(q => (
            <Link key={q.href} href={q.href} className="glass-subtle group" style={{ padding: "14px 16px", display: "block", textDecoration: "none", transition: "all 0.2s" }}>
              <div className="flex items-center justify-between mb-2">
                <q.icon size={18} style={{ color: "#B7C6BE" }} />
                <ArrowUpRight size={12} style={{ color: "#6b8a7a" }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-sm font-medium" style={{ color: "#F2EEE8" }}>{q.label}</p>
              <p className="text-xs mt-0.5" style={{ color: "#6b8a7a" }}>{q.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="glass" style={{ padding: "20px 24px" }}>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={16} style={{ color: "#6b8a7a" }} />
            <h3 className="text-sm font-semibold" style={{ color: "#F2EEE8" }}>Account Status</h3>
          </div>
          <div className="space-y-2">
            {checks.map(c => (
              <div key={c.label} className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span className="text-sm" style={{ color: "#B7C6BE" }}>{c.label}</span>
                {c.ok ? (
                  <CheckCircle2 size={14} style={{ color: "#59C173" }} />
                ) : (
                  <XCircle size={14} style={{ color: "#6b8a7a" }} />
                )}
              </div>
            ))}
          </div>
          {pct < 100 && (
            <Link href="/dashboard/profile" className="text-xs mt-3 inline-block" style={{ color: "#569578", textDecoration: "none" }}>
              Complete your profile →
            </Link>
          )}
        </div>

        <div className="glass" style={{ padding: "20px 24px" }}>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} style={{ color: "#6b8a7a" }} />
            <h3 className="text-sm font-semibold" style={{ color: "#F2EEE8" }}>Recent Activity</h3>
          </div>
          {activity.length === 0 ? (
            <p className="text-sm" style={{ color: "#6b8a7a" }}>No recent activity</p>
          ) : (
            <div className="space-y-0">
              {activity.map((a) => (
                <div key={a.id} className="table-row">
                  <span className="text-sm" style={{ color: "#B7C6BE" }}>{a.action}</span>
                  <span className="text-xs" style={{ color: "#6b8a7a" }}>{new Date(a.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="glass-subtle" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#59C173", flexShrink: 0 }} />
        <p className="text-xs" style={{ color: "#6b8a7a" }}>
          Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          {user.country ? ` · ${user.country}` : ""}
          {user.language ? ` · ${user.language.toUpperCase()}` : ""}
        </p>
      </div>
    </div>
  );
}
