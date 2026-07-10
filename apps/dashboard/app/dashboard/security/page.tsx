"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Shield, Lock, Mail, Smartphone, Key, Monitor, AlertTriangle } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Me = { email: string; emailVerified: boolean; phoneVerified: boolean; is2FAEnabled: boolean; phoneNumber: string | null };
type Session = { id: string; userAgent: string | null; ipAddress: string | null; createdAt: string };

export default function SecurityPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(`${API}/api/profile`, { credentials: "include" }).then(r => r.ok ? r.json() : null).then(setMe).catch(() => {});
    fetch(`${API}/api/security/sessions`, { credentials: "include" }).then(r => r.ok ? r.json() : []).then(setSessions).catch(() => {});
  }, []);

  const changePassword = useCallback(async () => {
    if (!currentPw || newPw.length < 8) { setToast("Password must be 8+ characters"); setTimeout(() => setToast(null), 3000); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/security/password`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      if (res.ok) { setToast("Password changed"); setCurrentPw(""); setNewPw(""); }
      else setToast(await res.text() || "Failed");
    } catch { setToast("Connection error"); }
    setLoading(false);
    setTimeout(() => setToast(null), 3000);
  }, [currentPw, newPw]);

  const terminateSession = useCallback(async (id: string) => {
    try {
      await fetch(`${API}/api/security/sessions`, {
        method: "DELETE", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id }),
      });
      setSessions(s => s.filter(x => x.id !== id));
      setToast("Session terminated");
    } catch { setToast("Failed"); }
    setTimeout(() => setToast(null), 3000);
  }, []);

  if (!me) return null;

  const score = [me.emailVerified, me.phoneVerified, me.is2FAEnabled, true].filter(Boolean).length;
  const scorePct = Math.round((score / 4) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>Security</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Protect your account</p>
      </div>

      <div className="glass" style={{ padding: "20px 24px" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield size={20} style={{ color: "var(--text)" }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Security Score</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Based on your security settings</p>
            </div>
          </div>
          <span className="stat-value" style={{ color: scorePct >= 75 ? "var(--success)" : "var(--danger)" }}>{scorePct}%</span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { label: "Password", desc: "Change your password", icon: Lock, active: true },
          { label: "Email Verification", desc: me.emailVerified ? "Verified" : "Not verified", icon: Mail, badge: me.emailVerified },
          { label: "Phone Verification", desc: me.phoneVerified ? "Verified" : "Not verified", icon: Smartphone, badge: me.phoneVerified },
          { label: "Two-Factor Auth", desc: me.is2FAEnabled ? "Enabled" : "Disabled", icon: Key, badge: me.is2FAEnabled },
        ].map(item => (
          <div key={item.label} className="glass" style={{ padding: "18px 20px" }}>
            <div className="flex items-center gap-3">
              <item.icon size={18} style={{ color: "var(--text-secondary)" }} />
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{item.label}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
              </div>
              {item.badge !== undefined && (
                <span className={`badge ${item.badge ? "badge-success" : "badge-danger"}`}>{item.badge ? "Active" : "Inactive"}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="glass card-section space-y-4">
        <h3>Change Password</h3>
        <input type="password" placeholder="Current password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} className="input-field" />
        <input type="password" placeholder="New password (8+ characters)" value={newPw} onChange={e => setNewPw(e.target.value)} className="input-field" />
        <button onClick={changePassword} disabled={loading} className="btn btn-primary">{loading ? "Changing..." : "Change Password"}</button>
      </div>

      <div className="glass card-section space-y-4">
        <div className="flex items-center gap-2">
          <Monitor size={16} style={{ color: "var(--text-muted)" }} />
          <h3 style={{ marginBottom: 0 }}>Login Sessions</h3>
        </div>
        {sessions.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>No active sessions</p>
        ) : sessions.map((s, i) => (
          <div key={s.id} className="table-row">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Monitor size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              <div className="min-w-0">
                <p className="text-sm truncate" style={{ color: "var(--text)" }}>{s.userAgent || "Unknown device"}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {s.ipAddress || "Unknown IP"} · {new Date(s.createdAt).toLocaleDateString()}
                  {i === 0 && " · Current"}
                </p>
              </div>
            </div>
            {i !== 0 && (
              <button onClick={() => terminateSession(s.id)} className="btn btn-ghost" style={{ height: 32, fontSize: 12 }}>
                Terminate
              </button>
            )}
          </div>
        ))}
      </div>

      {toast && <div className={`toast ${toast.includes("changed") || toast.includes("terminated") ? "toast-success" : "toast-error"}`}>{toast}</div>}
    </div>
  );
}
