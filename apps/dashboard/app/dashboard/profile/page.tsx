"use client";

import { useState, useEffect, useRef } from "react";
import { Save, Shield, KeyRound } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Profile = {
  id: string; email: string; name: string | null; photoUrl: string | null;
  phoneNumber: string | null; occupation: string | null; bio: string | null;
  website: string | null; linkedin: string | null; github: string | null;
  twitter: string | null; country: string | null; timezone: string | null;
  language: string | null; companyName: string | null; companyRole: string | null;
  industry: string | null; companySize: string | null;
  hasPassword: boolean; hasGoogle: boolean; hasGithub: boolean;
  createdAt: string; updatedAt: string;
};

export default function ProfilePage() {
  const [p, setP] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fetched = useRef(false);

  const [showSetPassword, setShowSetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [settingPassword, setSettingPassword] = useState(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(`${API}/api/profile`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(setP)
      .catch(() => {});
  }, []);

  const update = (key: keyof Profile, val: string | null) => {
    if (p) setP({ ...p, [key]: val });
  };

  const save = async () => {
    if (!p) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/profile`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: p.name, phoneNumber: p.phoneNumber, occupation: p.occupation,
          bio: p.bio, website: p.website, linkedin: p.linkedin, github: p.github,
          twitter: p.twitter, country: p.country, timezone: p.timezone,
          language: p.language, companyName: p.companyName, companyRole: p.companyRole,
          industry: p.industry, companySize: p.companySize,
        }),
      });
      if (res.ok) { setToast("Profile saved"); setTimeout(() => setToast(null), 3000); }
      else setToast("Failed to save");
    } catch { setToast("Connection error"); }
    setSaving(false);
  };

  const requestOtp = async () => {
    try {
      const res = await fetch(`${API}/api/profile/request-edit-otp`, {
        method: "POST", credentials: "include",
      });
      if (res.ok) { setOtpSent(true); setToast("Code sent to your email"); }
      else setToast("Failed to send code");
    } catch { setToast("Connection error"); }
  };

  const verifyOtp = async () => {
    try {
      const res = await fetch(`${API}/api/profile/verify-edit-otp`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: otpCode }),
      });
      if (res.ok) { setOtpVerified(true); setToast("Verified!"); }
      else setToast("Invalid code");
    } catch { setToast("Connection error"); }
  };

  const setPassword = async () => {
    if (!newPassword || newPassword.length < 8) { setToast("Password must be 8+ chars"); return; }
    setSettingPassword(true);
    try {
      const res = await fetch(`${API}/api/security/set-password`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword, otpCode }),
      });
      if (res.ok) {
        setToast("Password set! You can now login with email + password");
        setP(p ? { ...p, hasPassword: true } : p);
        setShowSetPassword(false);
        setNewPassword(""); setOtpCode(""); setOtpSent(false); setOtpVerified(false);
      } else {
        const msg = await res.text();
        setToast(msg || "Failed to set password");
      }
    } catch { setToast("Connection error"); }
    setSettingPassword(false);
  };

  if (!p) return null;

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="glass card-section space-y-4">
      <h3>{title}</h3>
      {children}
    </div>
  );

  const Field = ({ label, value, onChange, type = "text", disabled }: {
    label: string; value: string | null; onChange?: (v: string) => void;
    type?: string; disabled?: boolean;
  }) => (
    <div>
      <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</label>
      <input type={type} value={value || ""} onChange={e => onChange?.(e.target.value)} disabled={disabled}
        className="input-field" style={disabled ? { opacity: 0.5, cursor: "not-allowed" } : {}} />
    </div>
  );

  const isOAuth = !p.hasPassword && (p.hasGoogle || p.hasGithub);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>Profile</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Manage your personal information</p>
        </div>
        <button onClick={save} disabled={saving} className="btn btn-primary">
          <Save size={14} />{saving ? "Saving..." : "Save"}
        </button>
      </div>

      {isOAuth && !p.hasPassword && (
        <div className="glass card-section" style={{ borderLeft: "3px solid var(--accent, #D8B36A)" }}>
          <div className="flex items-start gap-3">
            <Shield size={20} style={{ color: "var(--accent, #D8B36A)", marginTop: 2, flexShrink: 0 }} />
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                Signed in with {p.hasGoogle ? "Google" : "GitHub"}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                You don&apos;t have a password yet. Set one to enable email + password login as a backup.
              </p>
              {!showSetPassword ? (
                <button onClick={() => setShowSetPassword(true)} className="btn btn-outline mt-3" style={{ fontSize: 12, padding: "6px 14px" }}>
                  <KeyRound size={13} /> Set Password
                </button>
              ) : (
                <div className="mt-3 space-y-3" style={{ maxWidth: 360 }}>
                  {!otpSent ? (
                    <button onClick={requestOtp} className="btn btn-outline" style={{ fontSize: 12, padding: "6px 14px" }}>
                      Send verification code
                    </button>
                  ) : !otpVerified ? (
                    <div className="flex gap-2">
                      <input value={otpCode} onChange={e => setOtpCode(e.target.value)}
                        placeholder="Enter 6-digit code" maxLength={6}
                        className="input-field" style={{ flex: 1, fontSize: 13 }} />
                      <button onClick={verifyOtp} className="btn btn-primary" style={{ fontSize: 12, padding: "6px 14px" }}>
                        Verify
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                        placeholder="New password (8+ characters)" className="input-field" style={{ fontSize: 13 }} />
                      <button onClick={setPassword} disabled={settingPassword} className="btn btn-primary" style={{ fontSize: 12, padding: "6px 14px" }}>
                        {settingPassword ? "Setting..." : "Set Password"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Section title="Personal Information">
        <div className="flex items-center gap-4">
          <div className="avatar" style={{ width: 64, height: 64, fontSize: 22 }}>
            {p.photoUrl ? <img src={p.photoUrl} alt="" /> : p.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{p.name || "No name set"}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.email}</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {isOAuth ? `Connected via ${p.hasGoogle ? "Google" : "GitHub"}` : "Email + Password account"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name" value={p.name} onChange={v => update("name", v)} />
          <Field label="Occupation" value={p.occupation} onChange={v => update("occupation", v)} />
          <Field label="Email" value={p.email} disabled />
          <Field label="Phone" value={p.phoneNumber} onChange={v => update("phoneNumber", v)} type="tel" />
          <Field label="Country" value={p.country} onChange={v => update("country", v)} />
          <Field label="Timezone" value={p.timezone} onChange={v => update("timezone", v)} />
          <Field label="Language" value={p.language} onChange={v => update("language", v)} />
        </div>
      </Section>

      <Section title="About">
        <div>
          <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Bio</label>
          <textarea value={p.bio || ""} onChange={e => update("bio", e.target.value)} rows={3}
            className="input-field" style={{ height: "auto", padding: "10px 14px", resize: "vertical" }} placeholder="Tell us about yourself..." />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Website" value={p.website} onChange={v => update("website", v)} type="url" />
          <Field label="LinkedIn" value={p.linkedin} onChange={v => update("linkedin", v)} />
          <Field label="GitHub" value={p.github} onChange={v => update("github", v)} />
          <Field label="Twitter" value={p.twitter} onChange={v => update("twitter", v)} />
        </div>
      </Section>

      <Section title="Company">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Company Name" value={p.companyName} onChange={v => update("companyName", v)} />
          <Field label="Role" value={p.companyRole} onChange={v => update("companyRole", v)} />
          <Field label="Industry" value={p.industry} onChange={v => update("industry", v)} />
          <Field label="Company Size" value={p.companySize} onChange={v => update("companySize", v)} />
        </div>
      </Section>

      {toast && <div className={`toast ${toast.includes("saved") || toast.includes("Verified") || toast.includes("set") || toast.includes("Password") ? "toast-success" : "toast-error"}`}>{toast}</div>}
    </div>
  );
}
