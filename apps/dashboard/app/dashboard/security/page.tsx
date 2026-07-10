"use client";

import { useState, useEffect, useRef } from "react";
import { Shield, KeyRound, Smartphone, Lock, AlertTriangle, Eye, EyeOff } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type SecurityInfo = {
  hasPassword: boolean;
  is2FAEnabled: boolean;
  recoveryCodesCount: number;
  sessions: { id: string; createdAt: string; userAgent?: string; ipAddress?: string }[];
};

export default function SecurityPage() {
  const [info, setInfo] = useState<SecurityInfo | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const fetched = useRef(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(`${API}/api/profile`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setInfo({ hasPassword: d.hasPassword, is2FAEnabled: d.is2FAEnabled, recoveryCodesCount: 0, sessions: [] }); })
      .catch(() => {});
    fetch(`${API}/api/security/sessions`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.sessions) setInfo(prev => prev ? { ...prev, sessions: d.sessions } : prev); })
      .catch(() => {});
  }, []);

  const changePassword = async () => {
    if (!currentPw || !newPw) { setToast("Fill in all fields"); return; }
    if (newPw.length < 8) { setToast("New password must be 8+ characters"); return; }
    if (newPw !== confirmPw) { setToast("Passwords don't match"); return; }
    setChangingPw(true);
    try {
      const res = await fetch(`${API}/api/security/password`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      if (res.ok) {
        setToast("Password changed successfully");
        setCurrentPw(""); setNewPw(""); setConfirmPw("");
      } else {
        const msg = await res.text();
        setToast(msg || "Failed to change password");
      }
    } catch { setToast("Connection error"); }
    setChangingPw(false);
  };

  if (!info) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "#F2EEE8" }}>Security</h1>
        <p className="text-sm mt-0.5" style={{ color: "#7B7E84" }}>Manage your password, 2FA, and sessions</p>
      </div>

      <div className="glass card-section space-y-4">
        <div className="flex items-center gap-2.5">
          <KeyRound size={16} style={{ color: "#7B7E84" }} />
          <h3>Change Password</h3>
        </div>
        {info.hasPassword ? (
          <div className="space-y-3" style={{ maxWidth: 420 }}>
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: "#7B7E84" }}>Current Password</label>
              <div style={{ position: "relative" }}>
                <input type={showCurrentPw ? "text" : "password"} value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                  className="input-field" style={{ paddingRight: 40 }} placeholder="Enter current password" />
                <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#7B7E84", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                  {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: "#7B7E84" }}>New Password</label>
              <div style={{ position: "relative" }}>
                <input type={showNewPw ? "text" : "password"} value={newPw} onChange={e => setNewPw(e.target.value)}
                  className="input-field" style={{ paddingRight: 40 }} placeholder="8+ characters" />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#7B7E84", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                  {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: "#7B7E84" }}>Confirm Password</label>
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                className="input-field" placeholder="Repeat new password" />
            </div>
            <button onClick={changePassword} disabled={changingPw} className="btn btn-primary" style={{ fontSize: 13 }}>
              {changingPw ? "Changing..." : "Change Password"}
            </button>
          </div>
        ) : (
          <p className="text-sm" style={{ color: "#7B7E84" }}>
            You signed in with a social account. No password is set.
          </p>
        )}
      </div>

      <div className="glass card-section space-y-4">
        <div className="flex items-center gap-2.5">
          <Shield size={16} style={{ color: "#7B7E84" }} />
          <h3>Two-Factor Authentication</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: "#F2EEE8" }}>
              {info.is2FAEnabled ? "2FA is enabled" : "2FA is not enabled"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#7B7E84" }}>
              {info.is2FAEnabled ? "Your account has an extra layer of security" : "Add a second factor to secure your account"}
            </p>
          </div>
          <span className={`badge ${info.is2FAEnabled ? "badge-success" : "badge-danger"}`}>
            {info.is2FAEnabled ? "Active" : "Inactive"}
          </span>
        </div>
        {info.is2FAEnabled && info.recoveryCodesCount > 0 && (
          <p className="text-xs" style={{ color: "#7B7E84" }}>
            {info.recoveryCodesCount} recovery codes remaining
          </p>
        )}
      </div>

      <div className="glass card-section space-y-4">
        <div className="flex items-center gap-2.5">
          <Smartphone size={16} style={{ color: "#7B7E84" }} />
          <h3>Active Sessions</h3>
        </div>
        {info.sessions.length === 0 ? (
          <p className="text-sm" style={{ color: "#7B7E84" }}>No session data available</p>
        ) : (
          <div className="space-y-2">
            {info.sessions.map(s => (
              <div key={s.id} className="table-row">
                <div>
                  <p className="text-sm" style={{ color: "#A6A6A6" }}>{s.userAgent || "Unknown device"}</p>
                  <p className="text-xs" style={{ color: "#7B7E84" }}>{s.ipAddress || "Unknown IP"} · {new Date(s.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && <div className={`toast ${toast.includes("success") || toast.includes("Success") ? "toast-success" : "toast-error"}`}>{toast}</div>}
    </div>
  );
}
