"use client";

import { useState, useEffect, useRef } from "react";
import { Shield, KeyRound, Smartphone, Eye, EyeOff } from "lucide-react";
import { SecuritySkeleton } from "../../components/Skeleton";
import { AlertDialogProvider, useAlertDialog } from "../../components/AlertDialog";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type SecurityInfo = {
  hasPassword: boolean;
  is2FAEnabled: boolean;
  recoveryCodesCount: number;
  sessions: { id: string; createdAt: string; userAgent?: string; ipAddress?: string }[];
};

function SecurityContent() {
  const [info, setInfo] = useState<SecurityInfo | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const fetched = useRef(false);
  const { openAlert } = useAlertDialog();

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
      if (res.ok) { setToast("Password changed"); setCurrentPw(""); setNewPw(""); setConfirmPw(""); }
      else { const msg = await res.text(); setToast(msg || "Failed"); }
    } catch { setToast("Connection error"); }
    setChangingPw(false);
  };

  const revokeSession = (sessionId: string) => {
    openAlert({
      title: "Revoke Session",
      description: "This will sign you out of this device immediately. You can't undo this action.",
      confirmLabel: "Revoke",
      cancelLabel: "Keep",
      variant: "danger",
      onConfirm: async () => {
        await fetch(`${API}/api/security/sessions/${sessionId}`, { method: "DELETE", credentials: "include" });
        setInfo(prev => prev ? { ...prev, sessions: prev.sessions.filter(s => s.id !== sessionId) } : prev);
        setToast("Session revoked");
      },
    });
  };

  if (!info) return <SecuritySkeleton />;

  return (
    <div className="space-y-8">
      <div className="section-header">
        <h1>Security</h1>
        <p>Manage your password, 2FA, and sessions</p>
      </div>

      <div className="glass card-section space-y-4">
        <div className="flex items-center gap-2.5">
          <KeyRound size={14} style={{ color: "var(--text-muted)" }} />
          <h3>Change Password</h3>
        </div>
        {info.hasPassword ? (
          <div className="space-y-3" style={{ maxWidth: 400 }}>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Current Password</label>
              <div style={{ position: "relative" }}>
                <input type={showCurrentPw ? "text" : "password"} value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                  className="input-field" style={{ paddingRight: 36 }} placeholder="Current password" />
                <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                  {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>New Password</label>
              <div style={{ position: "relative" }}>
                <input type={showNewPw ? "text" : "password"} value={newPw} onChange={e => setNewPw(e.target.value)}
                  className="input-field" style={{ paddingRight: 36 }} placeholder="8+ characters" />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                  {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Confirm Password</label>
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                className="input-field" placeholder="Repeat new password" />
            </div>
            <button onClick={changePassword} disabled={changingPw} className="btn btn-primary">
              {changingPw ? "Changing..." : "Change Password"}
            </button>
          </div>
        ) : (
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            You signed in with a social account. No password is set.
          </p>
        )}
      </div>

      <div className="glass card-section space-y-4">
        <div className="flex items-center gap-2.5">
          <Shield size={14} style={{ color: "var(--text-muted)" }} />
          <h3>Two-Factor Authentication</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: "#ffffff" }}>
              {info.is2FAEnabled ? "2FA is enabled" : "2FA is not enabled"}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              {info.is2FAEnabled ? "Extra layer of security" : "Add a second factor to secure your account"}
            </p>
          </div>
          <span className={`badge ${info.is2FAEnabled ? "badge-success" : "badge-danger"}`}>
            {info.is2FAEnabled ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div className="glass card-section space-y-4">
        <div className="flex items-center gap-2.5">
          <Smartphone size={14} style={{ color: "var(--text-muted)" }} />
          <h3>Active Sessions</h3>
        </div>
        {info.sessions.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No session data available</p>
        ) : (
          <div>
            {info.sessions.map(s => (
              <div key={s.id} className="table-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{s.userAgent || "Unknown device"}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{s.ipAddress || "Unknown IP"} · {new Date(s.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={() => revokeSession(s.id)} className="btn btn-ghost" style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && <div className={`toast ${toast.includes("changed") ? "toast-success" : "toast-error"}`}>{toast}</div>}
    </div>
  );
}

export default function SecurityPage() {
  return (
    <AlertDialogProvider>
      <SecurityContent />
    </AlertDialogProvider>
  );
}
