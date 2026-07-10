"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  User, Shield, Building2, Bell, ArrowRight, Clock, Zap, Key,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Me = {
  id: string; email: string; name: string | null; photoUrl: string | null;
  occupation: string | null; adminRole: string | null;
  createdAt: string; emailVerified: boolean; phoneVerified: boolean;
  is2FAEnabled: boolean;
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
  const completion = [user.name, user.occupation, user.emailVerified, user.phoneVerified, user.is2FAEnabled].filter(Boolean).length;
  const pct = Math.round((completion / 5) * 100);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="avatar" style={{ width: 56, height: 56, fontSize: 20 }}>
          {user.photoUrl ? <img src={user.photoUrl} alt="" /> : initials}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>{user.name || "Welcome"}</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{user.occupation || "Member"}{user.adminRole ? ` · ${user.adminRole.replace("_", " ")}` : ""}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Account Completion", value: `${pct}%`, icon: Zap },
          { label: "Role", value: user.adminRole?.replace("_", " ") || "Member", icon: User },
          { label: "2FA", value: user.is2FAEnabled ? "Enabled" : "Disabled", icon: Shield },
          { label: "Verified", value: user.emailVerified ? "Yes" : "No", icon: Key },
        ].map((s) => (
          <div key={s.label} className="glass" style={{ padding: "16px 18px" }}>
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={14} style={{ color: "var(--text-muted)" }} />
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{s.label}</span>
            </div>
            <p className="text-lg font-bold" style={{ color: "var(--text)" }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Edit Profile", href: "/dashboard/profile", icon: User },
          { label: "Security", href: "/dashboard/security", icon: Shield },
          { label: "Workspace", href: "/dashboard/workspace", icon: Building2 },
          { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
        ].map(q => (
          <Link key={q.href} href={q.href} className="glass group" style={{ padding: "14px 16px", display: "block", textDecoration: "none" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <q.icon size={16} style={{ color: "var(--text-muted)" }} />
                <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{q.label}</span>
              </div>
              <ArrowRight size={14} style={{ color: "var(--text-muted)" }} className="transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>

      <div className="glass" style={{ padding: "20px 24px" }}>
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} style={{ color: "var(--text-muted)" }} />
          <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>Recent Activity</h3>
        </div>
        {activity.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>No recent activity</p>
        ) : (
          <div className="space-y-0">
            {activity.map((a) => (
              <div key={a.id} className="table-row">
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{a.action}</span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
