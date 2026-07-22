"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  KeyRound,
  Smartphone,
  Eye,
  EyeOff,
  Monitor,
  Laptop,
  Tablet,
  Globe,
  ChevronRight,
  ChevronDown,
  Lock,
  Mail,
  Phone,
  RefreshCw,
  Copy,
  Check,
  LogOut,
  AlertTriangle,
  Fingerprint,
  QrCode,
  BadgeCheck,
  Clock,
  MapPin,
} from "lucide-react";
import { SecuritySkeleton } from "../../components/Skeleton";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type SecurityEvent = {
  id: string;
  type: "sign_in" | "password_change" | "2fa_enable" | "2fa_disable" | "recovery_change" | "session_revoke" | "passkey_add";
  description: string;
  date: string;
  location?: string;
  ip?: string;
  userAgent?: string;
};

type Device = {
  id: string;
  name: string;
  type: "desktop" | "mobile" | "tablet" | "unknown";
  lastActive: string;
  location?: string;
  ip?: string;
  userAgent?: string;
  isCurrent: boolean;
};

type SecurityInfo = {
  hasPassword: boolean;
  is2FAEnabled: boolean;
  recoveryCodesCount: number;
  sessions: { id: string; createdAt: string; userAgent?: string; ipAddress?: string; location?: string }[];
  recoveryEmail?: string;
  recoveryPhone?: string;
  backupCodes?: string[];
  events?: SecurityEvent[];
  devices?: Device[];
  passkeys?: { id: string; name: string; createdAt: string }[];
  lastPasswordChange?: string;
  totpEnabled?: boolean;
  skipPassword?: boolean;
  phones?: { number: string; verified: boolean }[];
  passwordCheckResult?: { weak: number; reused: number; total: number };
};

function getDeviceIcon(type: Device["type"]) {
  switch (type) {
    case "desktop": return <Monitor size={16} />;
    case "mobile": return <Smartphone size={16} />;
    case "tablet": return <Tablet size={16} />;
    default: return <Globe size={16} />;
  }
}

function getEventIcon(type: SecurityEvent["type"]) {
  switch (type) {
    case "sign_in": return <ShieldCheck size={14} style={{ color: "var(--success)" }} />;
    case "password_change": return <KeyRound size={14} style={{ color: "var(--warning)" }} />;
    case "2fa_enable": return <ShieldCheck size={14} style={{ color: "var(--success)" }} />;
    case "2fa_disable": return <ShieldX size={14} style={{ color: "var(--danger)" }} />;
    case "recovery_change": return <RefreshCw size={14} style={{ color: "var(--text-muted)" }} />;
    case "session_revoke": return <ShieldAlert size={14} style={{ color: "var(--danger)" }} />;
    case "passkey_add": return <Fingerprint size={14} style={{ color: "var(--success)" }} />;
    default: return <Shield size={14} style={{ color: "var(--text-muted)" }} />;
  }
}

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 2) return { score: 1, label: "Weak", color: "var(--danger)" };
  if (score <= 3) return { score: 2, label: "Medium", color: "var(--warning)" };
  return { score: 3, label: "Strong", color: "var(--success)" };
}

function maskPhone(phone: string): string {
  if (phone.length <= 4) return phone;
  return phone.slice(0, 3) + "-" + phone.slice(3);
}

export default function SecurityPage() {
  const [info, setInfo] = useState<SecurityInfo | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const fetched = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [regeneratingCodes, setRegeneratingCodes] = useState(false);

  const [showTotpSetup, setShowTotpSetup] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [totpSecret, setTotpSecret] = useState("");
  const [verifyingTotp, setVerifyingTotp] = useState(false);

  const [skipPassword, setSkipPassword] = useState(true);
  const [showPasswordCheck, setShowPasswordCheck] = useState(false);
  const [checkingPasswords, setCheckingPasswords] = useState(false);
  const [passwordCheckResult, setPasswordCheckResult] = useState<{ weak: number; reused: number; total: number } | null>(null);

  const [addPhoneMode, setAddPhoneMode] = useState(false);
  const [newPhone, setNewPhone] = useState("");

  const [addRecoveryEmail, setAddRecoveryEmail] = useState(false);
  const [newRecoveryEmail, setNewRecoveryEmail] = useState("");

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    fetch(`${API}/api/profile`, { credentials: "include" })
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (d) {
          setInfo({
            hasPassword: d.hasPassword ?? false,
            is2FAEnabled: d.is2FAEnabled ?? false,
            recoveryCodesCount: d.recoveryCodesCount ?? 0,
            sessions: [],
            recoveryEmail: d.recoveryEmail ?? undefined,
            recoveryPhone: d.recoveryPhone ?? undefined,
            lastPasswordChange: d.lastPasswordChange ?? undefined,
            totpEnabled: d.totpEnabled ?? false,
            skipPassword: d.skipPassword ?? true,
            passkeys: d.passkeys ?? [],
            phones: d.phones ?? [],
            backupCodes: d.backupCodes ?? [],
          });
        }
      })
      .catch(() => {});

    fetch(`${API}/api/security/sessions`, { credentials: "include" })
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (d?.sessions)
          setInfo(prev =>
            prev
              ? {
                  ...prev,
                  sessions: d.sessions,
                  devices: d.sessions.map((s: { id: string; createdAt: string; userAgent?: string; ipAddress?: string; location?: string }, i: number) => ({
                    id: s.id,
                    name: s.userAgent?.split(" ").slice(-1)[0] || "Unknown device",
                    type: (s.userAgent?.toLowerCase().includes("mobile")
                      ? "mobile"
                      : s.userAgent?.toLowerCase().includes("tablet")
                        ? "tablet"
                        : "desktop") as Device["type"],
                    lastActive: s.createdAt,
                    location: s.location,
                    ip: s.ipAddress,
                    userAgent: s.userAgent,
                    isCurrent: i === 0,
                  })),
                }
              : prev
          );
      })
      .catch(() => {});

    fetch(`${API}/api/security/events`, { credentials: "include" })
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (d?.events)
          setInfo(prev => (prev ? { ...prev, events: d.events } : prev));
      })
      .catch(() => {});
  }, []);

  const changePassword = async () => {
    if (!currentPw || !newPw) {
      showToast("Fill in all fields", "error");
      return;
    }
    if (newPw.length < 8) {
      showToast("New password must be 8+ characters", "error");
      return;
    }
    if (newPw !== confirmPw) {
      showToast("Passwords don't match", "error");
      return;
    }
    setChangingPw(true);
    try {
      const res = await fetch(`${API}/api/security/password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      if (res.ok) {
        showToast("Password changed successfully");
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
        setShowChangePassword(false);
        setInfo(prev => (prev ? { ...prev, lastPasswordChange: new Date().toISOString() } : prev));
      } else {
        const msg = await res.text();
        showToast(msg || "Failed to change password", "error");
      }
    } catch {
      showToast("Connection error", "error");
    }
    setChangingPw(false);
  };

  const revokeSession = async (sessionId: string) => {
    if (!window.confirm("Sign out of this device? You can't undo this.")) return;
    try {
      await fetch(`${API}/api/security/sessions/${sessionId}`, {
        method: "DELETE",
        credentials: "include",
      });
      setInfo(prev =>
        prev
          ? {
              ...prev,
              sessions: prev.sessions.filter(s => s.id !== sessionId),
              devices: prev.devices?.filter(d => d.id !== sessionId),
            }
          : prev
      );
      showToast("Device signed out");
    } catch {
      showToast("Failed to sign out device", "error");
    }
  };

  const signOutAllOther = async () => {
    if (!window.confirm("Sign out of all other devices? This will end all other sessions.")) return;
    try {
      await fetch(`${API}/api/security/sessions/revoke-all`, {
        method: "DELETE",
        credentials: "include",
      });
      setInfo(prev =>
        prev
          ? {
              ...prev,
              sessions: prev.sessions.filter((_, i) => i === 0),
              devices: prev.devices?.filter(d => d.isCurrent),
            }
          : prev
      );
      showToast("All other devices signed out");
    } catch {
      showToast("Failed to sign out devices", "error");
    }
  };

  const regenerateBackupCodes = async () => {
    if (!window.confirm("Generate new backup codes? Your old codes will stop working.")) return;
    setRegeneratingCodes(true);
    try {
      const res = await fetch(`${API}/api/security/backup-codes/regenerate`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const d = await res.json();
        setInfo(prev =>
          prev
            ? { ...prev, backupCodes: d.codes, recoveryCodesCount: d.codes.length }
            : prev
        );
        setShowBackupCodes(true);
        showToast("New backup codes generated");
      } else {
        showToast("Failed to regenerate codes", "error");
      }
    } catch {
      showToast("Connection error", "error");
    }
    setRegeneratingCodes(false);
  };

  const setupTotp = async () => {
    try {
      const res = await fetch(`${API}/api/security/totp/setup`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const d = await res.json();
        setTotpSecret(d.secret);
        setShowTotpSetup(true);
      }
    } catch {
      showToast("Failed to start TOTP setup", "error");
    }
  };

  const verifyTotp = async () => {
    if (totpCode.length !== 6) {
      showToast("Enter the 6-digit code", "error");
      return;
    }
    setVerifyingTotp(true);
    try {
      const res = await fetch(`${API}/api/security/totp/verify`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: totpCode }),
      });
      if (res.ok) {
        showToast("Authenticator app enabled");
        setInfo(prev => (prev ? { ...prev, totpEnabled: true, is2FAEnabled: true } : prev));
        setShowTotpSetup(false);
        setTotpCode("");
      } else {
        showToast("Invalid code, try again", "error");
      }
    } catch {
      showToast("Connection error", "error");
    }
    setVerifyingTotp(false);
  };

  const disableTotp = async () => {
    if (!window.confirm("Disable authenticator app? Your account will be less secure.")) return;
    try {
      const res = await fetch(`${API}/api/security/totp/disable`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        showToast("Authenticator app disabled");
        setInfo(prev => (prev ? { ...prev, totpEnabled: false } : prev));
      } else {
        showToast("Failed to disable", "error");
      }
    } catch {
      showToast("Connection error", "error");
    }
  };

  const addPhone = async () => {
    if (!newPhone.trim()) {
      showToast("Enter a phone number", "error");
      return;
    }
    try {
      const res = await fetch(`${API}/api/security/phones`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: newPhone }),
      });
      if (res.ok) {
        showToast("Phone number added");
        setInfo(prev =>
          prev
            ? { ...prev, phones: [...(prev.phones ?? []), { number: newPhone, verified: true }], recoveryPhone: newPhone }
            : prev
        );
        setNewPhone("");
        setAddPhoneMode(false);
      } else {
        showToast("Failed to add phone", "error");
      }
    } catch {
      showToast("Connection error", "error");
    }
  };

  const removePhone = async (number: string) => {
    if (!window.confirm(`Remove ${number}?`)) return;
    try {
      await fetch(`${API}/api/security/phones`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number }),
      });
      setInfo(prev =>
        prev
          ? {
              ...prev,
              phones: prev.phones?.filter(p => p.number !== number),
              recoveryPhone: prev.recoveryPhone === number ? undefined : prev.recoveryPhone,
            }
          : prev
      );
      showToast("Phone removed");
    } catch {
      showToast("Connection error", "error");
    }
  };

  const updateRecoveryEmail = async () => {
    if (!newRecoveryEmail.trim() || !newRecoveryEmail.includes("@")) {
      showToast("Enter a valid email", "error");
      return;
    }
    try {
      const res = await fetch(`${API}/api/security/recovery-email`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newRecoveryEmail }),
      });
      if (res.ok) {
        showToast("Recovery email updated");
        setInfo(prev => (prev ? { ...prev, recoveryEmail: newRecoveryEmail } : prev));
        setNewRecoveryEmail("");
        setAddRecoveryEmail(false);
      } else {
        showToast("Failed to update email", "error");
      }
    } catch {
      showToast("Connection error", "error");
    }
  };

  const runPasswordCheck = async () => {
    setCheckingPasswords(true);
    setPasswordCheckResult(null);
    try {
      const res = await fetch(`${API}/api/security/password-check`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const d = await res.json();
        setPasswordCheckResult(d);
      } else {
        showToast("Password check not available", "error");
      }
    } catch {
      showToast("Connection error", "error");
    }
    setCheckingPasswords(false);
  };

  if (!info) return <SecuritySkeleton />;

  const pwStrength = getPasswordStrength(newPw);

  return (
    <div className="space-y-6">
      <div className="section-header">
        <h1>Security</h1>
        <p>Manage your sign-in methods, devices, and account protection</p>
      </div>

      {/* ── Recent Security Activity ── */}
      <div className="glass card-section">
        <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
          <div className="flex items-center gap-2.5">
            <Shield size={15} style={{ color: "var(--text-muted)" }} />
            <h3 style={{ margin: 0 }}>Recent security activity</h3>
          </div>
          <button className="btn btn-ghost" style={{ fontSize: 12, height: 30, padding: "0 12px" }}>
            Review activity
            <ChevronRight size={12} />
          </button>
        </div>

        {!info.events || info.events.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { icon: <ShieldCheck size={14} style={{ color: "var(--success)" }} />, desc: "New sign-in on Chrome · Windows", date: "Today, 2:14 PM", loc: "Kathmandu, Nepal", ip: "192.168.1.1" },
              { icon: <KeyRound size={14} style={{ color: "var(--warning)" }} />, desc: "Password changed", date: "Jun 17, 2026", loc: "Kathmandu, Nepal", ip: "192.168.1.1" },
              { icon: <ShieldCheck size={14} style={{ color: "var(--success)" }} />, desc: "2-step verification enabled", date: "Jun 17, 2026", loc: "Kathmandu, Nepal", ip: "192.168.1.1" },
              { icon: <Fingerprint size={14} style={{ color: "var(--success)" }} />, desc: "Passkey added", date: "Jun 10, 2026", loc: "Kathmandu, Nepal", ip: "192.168.1.1" },
            ].map((ev, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1,
                }}>
                  {ev.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{ev.desc}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{ev.date}</span>
                    <span style={{ fontSize: 11, color: "var(--text-ash)" }}>·</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                      <MapPin size={10} /> {ev.loc}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-ash)" }}>·</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{ev.ip}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {info.events.slice(0, 5).map(ev => (
              <div key={ev.id} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1,
                }}>
                  {getEventIcon(ev.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{ev.description}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    {ev.location && (
                      <>
                        <span style={{ fontSize: 11, color: "var(--text-ash)" }}>·</span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                          <MapPin size={10} /> {ev.location}
                        </span>
                      </>
                    )}
                    {ev.ip && (
                      <>
                        <span style={{ fontSize: 11, color: "var(--text-ash)" }}>·</span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{ev.ip}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── How you sign in to Tirbeo ── */}
      <div className="glass card-section">
        <div className="flex items-center gap-2.5" style={{ marginBottom: 20 }}>
          <Lock size={15} style={{ color: "var(--text-muted)" }} />
          <h3 style={{ margin: 0 }}>How you sign in to Tirbeo</h3>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Passkeys */}
          <div className="table-row" style={{ flexDirection: "column", alignItems: "stretch", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Fingerprint size={16} style={{ color: "var(--text-muted)" }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>Passkeys and security keys</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    {info.passkeys && info.passkeys.length > 0
                      ? `${info.passkeys.length} passkey${info.passkeys.length !== 1 ? "s" : ""}`
                      : "No passkeys added"}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-ghost" style={{ fontSize: 11, height: 30 }}>Manage passkeys</button>
                <button className="btn btn-ghost" style={{ fontSize: 11, height: 30 }}>Add passkey</button>
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="table-row" style={{ flexDirection: "column", alignItems: "stretch", gap: showChangePassword ? 16 : 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <KeyRound size={16} style={{ color: "var(--text-muted)" }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>Password</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    {info.hasPassword
                      ? info.lastPasswordChange
                        ? `Last changed ${new Date(info.lastPasswordChange).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                        : "Password set"
                      : "No password set — signed in with social account"}
                  </p>
                </div>
              </div>
              <button
                className="btn btn-ghost"
                style={{ fontSize: 11, height: 30 }}
                onClick={() => setShowChangePassword(!showChangePassword)}
              >
                {info.hasPassword ? "Change password" : "Set password"}
                <ChevronDown
                  size={12}
                  style={{
                    transition: "transform 0.2s",
                    transform: showChangePassword ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>
            </div>

            {showChangePassword && (
              <div
                className="glass-subtle"
                style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14, animation: "fadeIn 0.2s ease" }}
              >
                {info.hasPassword && (
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--text-muted)", marginBottom: 6 }}>
                      Current password
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showCurrentPw ? "text" : "password"}
                        value={currentPw}
                        onChange={e => setCurrentPw(e.target.value)}
                        className="input-field"
                        style={{ paddingRight: 36 }}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                        style={{
                          position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                          color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: 4,
                        }}
                      >
                        {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--text-muted)", marginBottom: 6 }}>
                    New password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={newPw}
                      onChange={e => setNewPw(e.target.value)}
                      className="input-field"
                      style={{ paddingRight: 36 }}
                      placeholder="8+ characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      style={{
                        position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                        color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: 4,
                      }}
                    >
                      {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {newPw.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <div style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                          <div
                            style={{
                              height: "100%",
                              width: `${(pwStrength.score / 3) * 100}%`,
                              background: pwStrength.color,
                              borderRadius: 2,
                              transition: "width 0.3s ease, background 0.3s ease",
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, color: pwStrength.color, minWidth: 50 }}>
                          {pwStrength.label}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--text-muted)", marginBottom: 6 }}>
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)}
                    className="input-field"
                    placeholder="Repeat new password"
                  />
                  {confirmPw.length > 0 && confirmPw !== newPw && (
                    <p style={{ fontSize: 10, color: "var(--danger)", marginTop: 4 }}>Passwords don&apos;t match</p>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <button onClick={changePassword} disabled={changingPw} className="btn btn-primary">
                    {changingPw ? "Changing..." : "Change Password"}
                  </button>
                  <button
                    onClick={() => {
                      setShowChangePassword(false);
                      setCurrentPw("");
                      setNewPw("");
                      setConfirmPw("");
                    }}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Skip password */}
          <div className="table-row">
            <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
              <div style={{ width: 16 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>Skip password when possible</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                  Use passkeys or other sign-in methods instead of a password
                </p>
              </div>
            </div>
            <div
              className={`toggle ${skipPassword ? "active" : ""}`}
              onClick={() => setSkipPassword(!skipPassword)}
              role="switch"
              aria-checked={skipPassword}
              style={{ cursor: "pointer" }}
            />
          </div>

          {/* Authenticator app */}
          <div className="table-row" style={{ flexDirection: "column", alignItems: "stretch", gap: showTotpSetup ? 16 : 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Smartphone size={16} style={{ color: "var(--text-muted)" }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>Authenticator app</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    {info.totpEnabled ? (
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <BadgeCheck size={11} style={{ color: "var(--success)" }} />
                        Enabled
                      </span>
                    ) : (
                      "Not set up"
                    )}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {info.totpEnabled && (
                  <span className="badge badge-success" style={{ fontSize: 10 }}>Active</span>
                )}
                {info.totpEnabled ? (
                  <button onClick={disableTotp} className="btn btn-danger" style={{ fontSize: 11, height: 30 }}>
                    Disable
                  </button>
                ) : (
                  <button onClick={setupTotp} className="btn btn-ghost" style={{ fontSize: 11, height: 30 }}>
                    Set up
                  </button>
                )}
              </div>
            </div>

            {showTotpSetup && (
              <div
                className="glass-subtle"
                style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16, animation: "fadeIn 0.2s ease" }}
              >
                <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
                  {/* QR Code placeholder */}
                  <div
                    style={{
                      width: 160, height: 160, borderRadius: 12,
                      background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center",
                      flexDirection: "column", gap: 8, flexShrink: 0,
                    }}
                  >
                    <QrCode size={48} style={{ color: "#000000" }} />
                    <span style={{ fontSize: 10, color: "#666666" }}>Scan with authenticator</span>
                  </div>

                  <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>
                        Or enter this key manually:
                      </p>
                      <div
                        style={{
                          padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)",
                          border: "1px solid var(--border)", fontFamily: "monospace", fontSize: 13,
                          color: "var(--text)", letterSpacing: "0.05em", wordBreak: "break-all",
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                        }}
                      >
                        <span>{totpSecret || "JBSWY3DPEHPK3PXP"}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(totpSecret || "JBSWY3DPEHPK3PXP");
                            showToast("Copied to clipboard");
                          }}
                          style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--text-muted)", marginBottom: 6 }}>
                        Enter 6-digit verification code
                      </label>
                      <input
                        type="text"
                        value={totpCode}
                        onChange={e => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="input-field"
                        style={{
                          maxWidth: 180, textAlign: "center", fontFamily: "monospace",
                          fontSize: 18, letterSpacing: "0.3em", fontWeight: 600,
                        }}
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={verifyTotp} disabled={verifyingTotp || totpCode.length !== 6} className="btn btn-primary">
                        {verifyingTotp ? "Verifying..." : "Enable authenticator"}
                      </button>
                      <button
                        onClick={() => {
                          setShowTotpSetup(false);
                          setTotpCode("");
                          setTotpSecret("");
                        }}
                        className="btn btn-ghost"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2-Step Verification Phones */}
          <div className="table-row" style={{ flexDirection: "column", alignItems: "stretch", gap: addPhoneMode ? 12 : 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Phone size={16} style={{ color: "var(--text-muted)" }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>2-Step verification phones</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    {info.phones && info.phones.length > 0
                      ? info.phones.map(p => maskPhone(p.number)).join(", ")
                      : "No phone numbers added"}
                  </p>
                </div>
              </div>
              <button
                className="btn btn-ghost"
                style={{ fontSize: 11, height: 30 }}
                onClick={() => setAddPhoneMode(!addPhoneMode)}
              >
                Add phone
                <ChevronDown
                  size={12}
                  style={{
                    transition: "transform 0.2s",
                    transform: addPhoneMode ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>
            </div>

            {info.phones && info.phones.length > 0 && !addPhoneMode && (
              <div style={{ paddingLeft: 28 }}>
                {info.phones.map(p => (
                  <div key={p.number} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{maskPhone(p.number)}</span>
                    <button
                      onClick={() => removePhone(p.number)}
                      className="btn btn-ghost"
                      style={{ fontSize: 10, height: 26, padding: "0 10px", color: "var(--danger)" }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {addPhoneMode && (
              <div
                className="glass-subtle"
                style={{ padding: 16, display: "flex", gap: 8, alignItems: "center", animation: "fadeIn 0.2s ease" }}
              >
                <input
                  type="tel"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  className="input-field"
                  placeholder="+977 971-4374009"
                  style={{ flex: 1 }}
                />
                <button onClick={addPhone} className="btn btn-primary" style={{ fontSize: 11, height: 36 }}>
                  Add
                </button>
                <button
                  onClick={() => { setAddPhoneMode(false); setNewPhone(""); }}
                  className="btn btn-ghost"
                  style={{ fontSize: 11, height: 36 }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Backup Codes */}
          <div className="table-row" style={{ flexDirection: "column", alignItems: "stretch", gap: showBackupCodes ? 16 : 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <BadgeCheck size={16} style={{ color: "var(--text-muted)" }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>Backup codes</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    {info.recoveryCodesCount > 0
                      ? `${info.recoveryCodesCount} code${info.recoveryCodesCount !== 1 ? "s" : ""} available`
                      : "No backup codes"}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn btn-ghost"
                  style={{ fontSize: 11, height: 30 }}
                  onClick={() => setShowBackupCodes(!showBackupCodes)}
                >
                  {showBackupCodes ? "Hide codes" : "Show codes"}
                </button>
                <button
                  onClick={regenerateBackupCodes}
                  disabled={regeneratingCodes}
                  className="btn btn-ghost"
                  style={{ fontSize: 11, height: 30 }}
                >
                  <RefreshCw size={11} />
                  {regeneratingCodes ? "Generating..." : "Regenerate"}
                </button>
              </div>
            </div>

            {showBackupCodes && info.backupCodes && info.backupCodes.length > 0 && (
              <div
                className="glass-subtle"
                style={{ padding: 16, animation: "fadeIn 0.2s ease" }}
              >
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12 }}>
                  Each code can only be used once. Save these in a safe place.
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                    gap: 6,
                  }}
                >
                  {info.backupCodes.map((code, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 6,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--border)",
                        fontFamily: "monospace",
                        fontSize: 13,
                        color: "var(--text)",
                        letterSpacing: "0.05em",
                        textAlign: "center",
                      }}
                    >
                      {code}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(info.backupCodes!.join("\n"));
                    showToast("Codes copied to clipboard");
                  }}
                  className="btn btn-ghost"
                  style={{ fontSize: 11, height: 30, marginTop: 12 }}
                >
                  <Copy size={11} /> Copy all codes
                </button>
              </div>
            )}
          </div>

          {/* Recovery Phone */}
          <div className="table-row">
            <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
              <Phone size={16} style={{ color: "var(--text-muted)" }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>Recovery phone</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                  {info.recoveryPhone ? maskPhone(info.recoveryPhone) : "No recovery phone set"}
                </p>
              </div>
            </div>
            <button className="btn btn-ghost" style={{ fontSize: 11, height: 30 }}>
              {info.recoveryPhone ? "Change" : "Add phone"}
            </button>
          </div>

          {/* Recovery Email */}
          <div className="table-row" style={{ borderBottom: "none", flexDirection: "column", alignItems: "stretch", gap: addRecoveryEmail ? 12 : 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Mail size={16} style={{ color: "var(--text-muted)" }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>Recovery email</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    {info.recoveryEmail || "No recovery email set"}
                  </p>
                </div>
              </div>
              <button
                className="btn btn-ghost"
                style={{ fontSize: 11, height: 30 }}
                onClick={() => setAddRecoveryEmail(!addRecoveryEmail)}
              >
                {info.recoveryEmail ? "Change" : "Add email"}
              </button>
            </div>

            {addRecoveryEmail && (
              <div
                className="glass-subtle"
                style={{ padding: 16, display: "flex", gap: 8, alignItems: "center", animation: "fadeIn 0.2s ease" }}
              >
                <input
                  type="email"
                  value={newRecoveryEmail}
                  onChange={e => setNewRecoveryEmail(e.target.value)}
                  className="input-field"
                  placeholder="email@example.com"
                  style={{ flex: 1 }}
                />
                <button onClick={updateRecoveryEmail} className="btn btn-primary" style={{ fontSize: 11, height: 36 }}>
                  Save
                </button>
                <button
                  onClick={() => { setAddRecoveryEmail(false); setNewRecoveryEmail(""); }}
                  className="btn btn-ghost"
                  style={{ fontSize: 11, height: 36 }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Devices ── */}
      <div className="glass card-section">
        <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
          <div className="flex items-center gap-2.5">
            <Laptop size={15} style={{ color: "var(--text-muted)" }} />
            <h3 style={{ margin: 0 }}>Your devices</h3>
          </div>
          {(info.devices && info.devices.length > 1) && (
            <button onClick={signOutAllOther} className="btn btn-danger" style={{ fontSize: 11, height: 30 }}>
              <LogOut size={11} />
              Sign out all other devices
            </button>
          )}
        </div>

        {!info.devices || info.devices.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { name: "Chrome on Windows", type: "desktop" as const, lastActive: "Just now", loc: "Kathmandu, Nepal", ip: "192.168.1.1", current: true },
              { name: "Safari on iPhone", type: "mobile" as const, lastActive: "2 hours ago", loc: "Kathmandu, Nepal", ip: "10.0.0.1", current: false },
              { name: "Firefox on macOS", type: "desktop" as const, lastActive: "Yesterday", loc: "Lalitpur, Nepal", ip: "172.16.0.1", current: false },
            ].map((device, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 16px", borderRadius: 10,
                  background: device.current ? "rgba(255,255,255,0.04)" : "transparent",
                  border: `1px solid ${device.current ? "var(--border)" : "transparent"}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--text-muted)",
                  }}>
                    {getDeviceIcon(device.type)}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{device.name}</p>
                      {device.current && (
                        <span className="badge badge-success" style={{ fontSize: 9, padding: "2px 6px" }}>This device</span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                        <Clock size={10} /> {device.lastActive}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-ash)" }}>·</span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                        <MapPin size={10} /> {device.loc}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-ash)" }}>·</span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{device.ip}</span>
                    </div>
                  </div>
                </div>
                {!device.current && (
                  <button
                    className="btn btn-ghost"
                    style={{ fontSize: 11, height: 28, padding: "0 10px" }}
                  >
                    Sign out
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {info.devices.map(device => (
              <div
                key={device.id}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 16px", borderRadius: 10,
                  background: device.isCurrent ? "rgba(255,255,255,0.04)" : "transparent",
                  border: `1px solid ${device.isCurrent ? "var(--border)" : "transparent"}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--text-muted)",
                  }}>
                    {getDeviceIcon(device.type)}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
                        {device.name || device.userAgent?.split(" ").slice(-1)[0] || "Unknown device"}
                      </p>
                      {device.isCurrent && (
                        <span className="badge badge-success" style={{ fontSize: 9, padding: "2px 6px" }}>This device</span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                        <Clock size={10} /> {new Date(device.lastActive).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      {device.location && (
                        <>
                          <span style={{ fontSize: 11, color: "var(--text-ash)" }}>·</span>
                          <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                            <MapPin size={10} /> {device.location}
                          </span>
                        </>
                      )}
                      {device.ip && (
                        <>
                          <span style={{ fontSize: 11, color: "var(--text-ash)" }}>·</span>
                          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{device.ip}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {!device.isCurrent && (
                  <button
                    onClick={() => revokeSession(device.id)}
                    className="btn btn-ghost"
                    style={{ fontSize: 11, height: 28, padding: "0 10px" }}
                  >
                    Sign out
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Password Checkup ── */}
      <div className="glass card-section">
        <div className="flex items-center gap-2.5" style={{ marginBottom: 16 }}>
          <AlertTriangle size={15} style={{ color: "var(--text-muted)" }} />
          <h3 style={{ margin: 0 }}>Password Checkup</h3>
        </div>

        {!showPasswordCheck ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                Check if your saved passwords have been compromised in a known data breach.
              </p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                Your passwords are checked against a database of known breaches.
              </p>
            </div>
            <button
              onClick={() => {
                setShowPasswordCheck(true);
                runPasswordCheck();
              }}
              className="btn btn-ghost"
              style={{ fontSize: 11, height: 30, flexShrink: 0, marginLeft: 16 }}
            >
              Check passwords
            </button>
          </div>
        ) : (
          <div style={{ animation: "fadeIn 0.2s ease" }}>
            {checkingPasswords ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 0" }}>
                <RefreshCw size={14} style={{ color: "var(--text-muted)", animation: "spin 1s linear infinite" }} />
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Checking your passwords...</span>
              </div>
            ) : passwordCheckResult ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <div
                    style={{
                      padding: "14px 18px", borderRadius: 10,
                      background: passwordCheckResult.weak > 0 ? "var(--danger-subtle)" : "var(--success-subtle)",
                      border: `1px solid ${passwordCheckResult.weak > 0 ? "rgba(255,97,97,0.2)" : "rgba(89,212,153,0.2)"}`,
                      flex: 1, minWidth: 140,
                    }}
                  >
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Weak passwords</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: passwordCheckResult.weak > 0 ? "var(--danger)" : "var(--success)" }}>
                      {passwordCheckResult.weak}
                    </p>
                  </div>
                  <div
                    style={{
                      padding: "14px 18px", borderRadius: 10,
                      background: passwordCheckResult.reused > 0 ? "var(--warning-subtle)" : "var(--success-subtle)",
                      border: `1px solid ${passwordCheckResult.reused > 0 ? "rgba(255,197,51,0.2)" : "rgba(89,212,153,0.2)"}`,
                      flex: 1, minWidth: 140,
                    }}
                  >
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Reused passwords</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: passwordCheckResult.reused > 0 ? "var(--warning)" : "var(--success)" }}>
                      {passwordCheckResult.reused}
                    </p>
                  </div>
                  <div
                    style={{
                      padding: "14px 18px", borderRadius: 10,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--border)",
                      flex: 1, minWidth: 140,
                    }}
                  >
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Total checked</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>
                      {passwordCheckResult.total}
                    </p>
                  </div>
                </div>
                {passwordCheckResult.weak === 0 && passwordCheckResult.reused === 0 && (
                  <p style={{ fontSize: 12, color: "var(--success)", display: "flex", alignItems: "center", gap: 6 }}>
                    <ShieldCheck size={14} />
                    All your passwords look good.
                  </p>
                )}
                <button
                  onClick={() => {
                    setShowPasswordCheck(false);
                    setPasswordCheckResult(null);
                  }}
                  className="btn btn-ghost"
                  style={{ fontSize: 11, height: 28, alignSelf: "flex-start" }}
                >
                  Close
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className={`toast ${toast.type === "success" ? "toast-success" : "toast-error"}`}>
          {toast.type === "success" ? <Check size={13} style={{ marginRight: 6 }} /> : <AlertTriangle size={13} style={{ marginRight: 6 }} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
