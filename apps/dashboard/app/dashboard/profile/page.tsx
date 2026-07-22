"use client";

import { useState, useEffect, useRef } from "react";
import {
  Camera,
  User,
  Mail,
  Phone,
  Globe,
  Briefcase,
  FileText,
  Shield,
  Clock,
  Monitor,
  ChevronRight,
  Pencil,
  X,
  Check,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Profile = {
  id: string;
  email: string;
  name: string | null;
  photoUrl: string | null;
  phoneNumber: string | null;
  occupation: string | null;
  bio: string | null;
  website: string | null;
  linkedin: string | null;
  github: string | null;
  twitter: string | null;
  country: string | null;
  timezone: string | null;
  language: string | null;
  companyName: string | null;
  companyRole: string | null;
  industry: string | null;
  companySize: string | null;
  secondaryEmail: string | null;
  gender: string | null;
  birthday: string | null;
  hasPassword: boolean;
  hasGoogle: boolean;
  hasGithub: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

type SigninEntry = {
  device: string;
  ip: string;
  location: string;
  time: string;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncUuid(id: string) {
  return id.slice(0, 8) + "..." + id.slice(-4);
}

function EditableRow({
  label,
  value,
  editing,
  onStart,
  onCancel,
  children,
}: {
  label: string;
  value: string | null;
  editing: boolean;
  onStart: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "14px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: "var(--text-muted)",
          width: 160,
          flexShrink: 0,
          paddingTop: editing ? 8 : 0,
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {editing ? (
          children
        ) : (
          <div
            onClick={onStart}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 12px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              cursor: "pointer",
              minHeight: 40,
              transition: "border-color 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "var(--border-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "var(--border)")
            }
          >
            <span
              style={{
                fontSize: 13,
                color: value ? "var(--text)" : "var(--text-ash)",
              }}
            >
              {value || "Not set"}
            </span>
            <Pencil size={13} style={{ color: "var(--text-ash)", flexShrink: 0 }} />
          </div>
        )}
      </div>
      {editing && (
        <button
          onClick={onCancel}
          className="btn btn-ghost"
          style={{ height: 34, flexShrink: 0, marginTop: 8 }}
        >
          <X size={12} /> Cancel
        </button>
      )}
    </div>
  );
}

function TextEdit({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      className="input-field"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus
      style={{ height: 40 }}
    />
  );
}

function SelectEdit({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      className="input-field"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoFocus
      style={{ height: 40 }}
    >
      <option value="">Not set</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export default function ProfilePage() {
  const [p, setP] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fetched = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [editField, setEditField] = useState<string | null>(null);

  const [signins, setSignins] = useState<SigninEntry[]>([]);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(`${API}/api/profile`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setP(d);
      })
      .catch(() => {});

    fetch(`${API}/api/activity`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.signins) setSignins(d.signins);
      })
      .catch(() => {});
  }, []);

  const showToast = (msg: string, isError = false) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  const update = (key: keyof Profile, val: string | null) => {
    setP((prev) => (prev ? { ...prev, [key]: val } : prev));
  };

  const save = async () => {
    if (!p) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/profile`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: p.name,
          gender: p.gender,
          birthday: p.birthday,
          language: p.language,
          country: p.country,
          timezone: p.timezone,
          phoneNumber: p.phoneNumber,
          secondaryEmail: p.secondaryEmail,
          website: p.website,
          linkedin: p.linkedin,
          github: p.github,
          twitter: p.twitter,
          occupation: p.occupation,
          companyName: p.companyName,
          companyRole: p.companyRole,
          industry: p.industry,
          companySize: p.companySize,
          bio: p.bio,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        if (updated?.updatedAt) {
          setP((prev) =>
            prev ? { ...prev, updatedAt: updated.updatedAt } : prev
          );
        }
        showToast("Profile saved");
      } else {
        showToast("Failed to save", true);
      }
    } catch {
      showToast("Connection error", true);
    }
    setSaving(false);
  };

  if (!p) {
    return (
      <div style={{ padding: 40 }}>
        <div className="section-header">
          <h1>Personal Info</h1>
          <p>Loading your profile...</p>
        </div>
        <div className="glass card-section" style={{ marginTop: 24 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 40, marginBottom: 12, width: "100%" }}
            />
          ))}
        </div>
      </div>
    );
  }

  const initials = p.name
    ? p.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : p.email[0].toUpperCase();

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div className="section-header">
        <h1>Personal Info</h1>
        <p>Your name, gender, birthday, and other details</p>
      </div>

      {/* ── Avatar Section ── */}
      <div className="glass card-section" style={{ marginBottom: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 0,
          }}
        >
          <div style={{ position: "relative" }}>
            <div
              className="avatar"
              style={{
                width: 80,
                height: 80,
                fontSize: 28,
                borderRadius: "50%",
                cursor: "pointer",
              }}
              onClick={() => document.getElementById("avatar-input")?.click()}
            >
              {p.photoUrl ? (
                <img src={p.photoUrl} alt="" />
              ) : (
                initials
              )}
            </div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0,
                cursor: "pointer",
                transition: "opacity 0.2s",
              }}
              className="avatar-overlay"
              onClick={() => document.getElementById("avatar-input")?.click()}
            >
              <Camera size={20} style={{ color: "#fff" }} />
            </div>
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const fd = new FormData();
                fd.append("avatar", file);
                try {
                  const res = await fetch(`${API}/api/profile/avatar`, {
                    method: "POST",
                    credentials: "include",
                    body: fd,
                  });
                  if (res.ok) {
                    const d = await res.json();
                    setP((prev) =>
                      prev ? { ...prev, photoUrl: d.photoUrl } : prev
                    );
                    showToast("Photo updated");
                  } else {
                    showToast("Upload failed", true);
                  }
                } catch {
                  showToast("Upload failed", true);
                }
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "var(--text)",
                letterSpacing: "-0.02em",
              }}
            >
              {p.name || "No name set"}
            </p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
              {p.email}
            </p>
          </div>
          <button
            className="btn btn-ghost"
            style={{ flexShrink: 0 }}
            onClick={() =>
              document.getElementById("avatar-input")?.click()
            }
          >
            <Camera size={13} /> Change photo
          </button>
        </div>
      </div>

      <style>{`
        .avatar-overlay:hover { opacity: 1 !important; }
      `}</style>

      {/* ── Personal Info ── */}
      <div className="glass card-section" style={{ marginTop: 16 }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <User size={15} style={{ color: "var(--text-muted)" }} />
          Personal Information
        </h3>

        <EditableRow
          label="Name"
          value={p.name}
          editing={editField === "name"}
          onStart={() => setEditField("name")}
          onCancel={() => setEditField(null)}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="input-field"
              value={p.name || ""}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Full name"
              autoFocus
              style={{ height: 40, flex: 1 }}
            />
            <button
              className="btn btn-primary"
              style={{ height: 40, flexShrink: 0 }}
              onClick={() => setEditField(null)}
            >
              <Check size={13} /> Done
            </button>
          </div>
        </EditableRow>

        <EditableRow
          label="Gender"
          value={p.gender}
          editing={editField === "gender"}
          onStart={() => setEditField("gender")}
          onCancel={() => setEditField(null)}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select
              className="input-field"
              value={p.gender || ""}
              onChange={(e) => update("gender", e.target.value)}
              autoFocus
              style={{ height: 40, flex: 1 }}
            >
              <option value="">Not specified</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
            <button
              className="btn btn-primary"
              style={{ height: 40, flexShrink: 0 }}
              onClick={() => setEditField(null)}
            >
              <Check size={13} /> Done
            </button>
          </div>
        </EditableRow>

        <EditableRow
          label="Birthday"
          value={
            p.birthday
              ? new Date(p.birthday).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : null
          }
          editing={editField === "birthday"}
          onStart={() => setEditField("birthday")}
          onCancel={() => setEditField(null)}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="date"
              className="input-field"
              value={p.birthday ? p.birthday.split("T")[0] : ""}
              onChange={(e) => update("birthday", e.target.value || null)}
              autoFocus
              style={{ height: 40, flex: 1 }}
            />
            <button
              className="btn btn-primary"
              style={{ height: 40, flexShrink: 0 }}
              onClick={() => setEditField(null)}
            >
              <Check size={13} /> Done
            </button>
          </div>
        </EditableRow>

        <EditableRow
          label="Language"
          value={p.language}
          editing={editField === "language"}
          onStart={() => setEditField("language")}
          onCancel={() => setEditField(null)}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select
              className="input-field"
              value={p.language || ""}
              onChange={(e) => update("language", e.target.value)}
              autoFocus
              style={{ height: 40, flex: 1 }}
            >
              <option value="">Not set</option>
              <option value="en">English</option>
              <option value="ne">Nepali</option>
              <option value="hi">Hindi</option>
              <option value="zh">Chinese</option>
              <option value="ja">Japanese</option>
              <option value="ko">Korean</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ar">Arabic</option>
              <option value="pt">Portuguese</option>
              <option value="ru">Russian</option>
            </select>
            <button
              className="btn btn-primary"
              style={{ height: 40, flexShrink: 0 }}
              onClick={() => setEditField(null)}
            >
              <Check size={13} /> Done
            </button>
          </div>
        </EditableRow>

        <EditableRow
          label="Country"
          value={p.country}
          editing={editField === "country"}
          onStart={() => setEditField("country")}
          onCancel={() => setEditField(null)}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select
              className="input-field"
              value={p.country || ""}
              onChange={(e) => update("country", e.target.value)}
              autoFocus
              style={{ height: 40, flex: 1 }}
            >
              <option value="">Not set</option>
              <option value="NP">Nepal</option>
              <option value="IN">India</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="AU">Australia</option>
              <option value="JP">Japan</option>
              <option value="CN">China</option>
              <option value="KR">South Korea</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="CA">Canada</option>
              <option value="BR">Brazil</option>
              <option value="AE">UAE</option>
              <option value="SG">Singapore</option>
            </select>
            <button
              className="btn btn-primary"
              style={{ height: 40, flexShrink: 0 }}
              onClick={() => setEditField(null)}
            >
              <Check size={13} /> Done
            </button>
          </div>
        </EditableRow>

        <EditableRow
          label="Timezone"
          value={p.timezone}
          editing={editField === "timezone"}
          onStart={() => setEditField("timezone")}
          onCancel={() => setEditField(null)}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select
              className="input-field"
              value={p.timezone || ""}
              onChange={(e) => update("timezone", e.target.value)}
              autoFocus
              style={{ height: 40, flex: 1 }}
            >
              <option value="">Not set</option>
              <option value="Asia/Kathmandu">UTC+5:45 Nepal</option>
              <option value="Asia/Kolkata">UTC+5:30 India (IST)</option>
              <option value="Asia/Shanghai">UTC+8 China</option>
              <option value="Asia/Tokyo">UTC+9 Japan</option>
              <option value="Asia/Seoul">UTC+9 Korea</option>
              <option value="Asia/Singapore">UTC+8 Singapore</option>
              <option value="Europe/London">UTC+0 London</option>
              <option value="Europe/Berlin">UTC+1 Berlin</option>
              <option value="Europe/Paris">UTC+1 Paris</option>
              <option value="America/New_York">UTC-5 New York</option>
              <option value="America/Chicago">UTC-6 Chicago</option>
              <option value="America/Denver">UTC-7 Denver</option>
              <option value="America/Los_Angeles">UTC-8 Los Angeles</option>
              <option value="Australia/Sydney">UTC+10 Sydney</option>
              <option value="UTC">UTC+0</option>
            </select>
            <button
              className="btn btn-primary"
              style={{ height: 40, flexShrink: 0 }}
              onClick={() => setEditField(null)}
            >
              <Check size={13} /> Done
            </button>
          </div>
        </EditableRow>
      </div>

      {/* ── Contact Info ── */}
      <div className="glass card-section" style={{ marginTop: 16 }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Mail size={15} style={{ color: "var(--text-muted)" }} />
          Contact Information
        </h3>

        {/* Email — read-only */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 0",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--text-muted)",
              width: 160,
              flexShrink: 0,
            }}
          >
            Email
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                minHeight: 40,
              }}
            >
              <span style={{ fontSize: 13, color: "var(--text)" }}>
                {p.email}
              </span>
              {p.emailVerified ? (
                <span className="badge badge-success">Verified</span>
              ) : (
                <span className="badge badge-danger">Unverified</span>
              )}
            </div>
          </div>
        </div>

        <EditableRow
          label="Secondary Email"
          value={p.secondaryEmail}
          editing={editField === "secondaryEmail"}
          onStart={() => setEditField("secondaryEmail")}
          onCancel={() => setEditField(null)}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="input-field"
              type="email"
              value={p.secondaryEmail || ""}
              onChange={(e) => update("secondaryEmail", e.target.value || null)}
              placeholder="secondary@example.com"
              autoFocus
              style={{ height: 40, flex: 1 }}
            />
            <button
              className="btn btn-primary"
              style={{ height: 40, flexShrink: 0 }}
              onClick={() => setEditField(null)}
            >
              <Check size={13} /> Done
            </button>
          </div>
        </EditableRow>

        <EditableRow
          label="Phone Number"
          value={p.phoneNumber}
          editing={editField === "phoneNumber"}
          onStart={() => setEditField("phoneNumber")}
          onCancel={() => setEditField(null)}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="input-field"
              type="tel"
              value={p.phoneNumber || ""}
              onChange={(e) => update("phoneNumber", e.target.value)}
              placeholder="+977 98XXXXXXXX"
              autoFocus
              style={{ height: 40, flex: 1 }}
            />
            <button
              className="btn btn-primary"
              style={{ height: 40, flexShrink: 0 }}
              onClick={() => setEditField(null)}
            >
              <Check size={13} /> Done
            </button>
          </div>
        </EditableRow>

        <EditableRow
          label="Website"
          value={p.website}
          editing={editField === "website"}
          onStart={() => setEditField("website")}
          onCancel={() => setEditField(null)}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="input-field"
              type="url"
              value={p.website || ""}
              onChange={(e) => update("website", e.target.value)}
              placeholder="https://yoursite.com"
              autoFocus
              style={{ height: 40, flex: 1 }}
            />
            <button
              className="btn btn-primary"
              style={{ height: 40, flexShrink: 0 }}
              onClick={() => setEditField(null)}
            >
              <Check size={13} /> Done
            </button>
          </div>
        </EditableRow>

        <EditableRow
          label="LinkedIn"
          value={p.linkedin}
          editing={editField === "linkedin"}
          onStart={() => setEditField("linkedin")}
          onCancel={() => setEditField(null)}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="input-field"
              value={p.linkedin || ""}
              onChange={(e) => update("linkedin", e.target.value)}
              placeholder="linkedin.com/in/you"
              autoFocus
              style={{ height: 40, flex: 1 }}
            />
            <button
              className="btn btn-primary"
              style={{ height: 40, flexShrink: 0 }}
              onClick={() => setEditField(null)}
            >
              <Check size={13} /> Done
            </button>
          </div>
        </EditableRow>

        <EditableRow
          label="GitHub"
          value={p.github}
          editing={editField === "github"}
          onStart={() => setEditField("github")}
          onCancel={() => setEditField(null)}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="input-field"
              value={p.github || ""}
              onChange={(e) => update("github", e.target.value)}
              placeholder="github.com/username"
              autoFocus
              style={{ height: 40, flex: 1 }}
            />
            <button
              className="btn btn-primary"
              style={{ height: 40, flexShrink: 0 }}
              onClick={() => setEditField(null)}
            >
              <Check size={13} /> Done
            </button>
          </div>
        </EditableRow>

        <EditableRow
          label="Twitter / X"
          value={p.twitter}
          editing={editField === "twitter"}
          onStart={() => setEditField("twitter")}
          onCancel={() => setEditField(null)}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="input-field"
              value={p.twitter || ""}
              onChange={(e) => update("twitter", e.target.value)}
              placeholder="@username"
              autoFocus
              style={{ height: 40, flex: 1 }}
            />
            <button
              className="btn btn-primary"
              style={{ height: 40, flexShrink: 0 }}
              onClick={() => setEditField(null)}
            >
              <Check size={13} /> Done
            </button>
          </div>
        </EditableRow>
      </div>

      {/* ── Work & Identity ── */}
      <div className="glass card-section" style={{ marginTop: 16 }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Briefcase size={15} style={{ color: "var(--text-muted)" }} />
          Work &amp; Identity
        </h3>

        <EditableRow
          label="Occupation"
          value={p.occupation}
          editing={editField === "occupation"}
          onStart={() => setEditField("occupation")}
          onCancel={() => setEditField(null)}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="input-field"
              value={p.occupation || ""}
              onChange={(e) => update("occupation", e.target.value)}
              placeholder="Software Engineer"
              autoFocus
              style={{ height: 40, flex: 1 }}
            />
            <button
              className="btn btn-primary"
              style={{ height: 40, flexShrink: 0 }}
              onClick={() => setEditField(null)}
            >
              <Check size={13} /> Done
            </button>
          </div>
        </EditableRow>

        <EditableRow
          label="Company Name"
          value={p.companyName}
          editing={editField === "companyName"}
          onStart={() => setEditField("companyName")}
          onCancel={() => setEditField(null)}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="input-field"
              value={p.companyName || ""}
              onChange={(e) => update("companyName", e.target.value)}
              placeholder="Acme Inc."
              autoFocus
              style={{ height: 40, flex: 1 }}
            />
            <button
              className="btn btn-primary"
              style={{ height: 40, flexShrink: 0 }}
              onClick={() => setEditField(null)}
            >
              <Check size={13} /> Done
            </button>
          </div>
        </EditableRow>

        <EditableRow
          label="Company Role"
          value={p.companyRole}
          editing={editField === "companyRole"}
          onStart={() => setEditField("companyRole")}
          onCancel={() => setEditField(null)}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="input-field"
              value={p.companyRole || ""}
              onChange={(e) => update("companyRole", e.target.value)}
              placeholder="Engineering Lead"
              autoFocus
              style={{ height: 40, flex: 1 }}
            />
            <button
              className="btn btn-primary"
              style={{ height: 40, flexShrink: 0 }}
              onClick={() => setEditField(null)}
            >
              <Check size={13} /> Done
            </button>
          </div>
        </EditableRow>

        <EditableRow
          label="Industry"
          value={p.industry}
          editing={editField === "industry"}
          onStart={() => setEditField("industry")}
          onCancel={() => setEditField(null)}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select
              className="input-field"
              value={p.industry || ""}
              onChange={(e) => update("industry", e.target.value)}
              autoFocus
              style={{ height: 40, flex: 1 }}
            >
              <option value="">Not set</option>
              <option value="technology">Technology</option>
              <option value="finance">Finance</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
              <option value="marketing">Marketing</option>
              <option value="design">Design</option>
              <option value="legal">Legal</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="retail">Retail</option>
              <option value="media">Media &amp; Entertainment</option>
              <option value="real_estate">Real Estate</option>
              <option value="hospitality">Hospitality</option>
              <option value="government">Government</option>
              <option value="nonprofit">Non-Profit</option>
              <option value="agriculture">Agriculture</option>
              <option value="other">Other</option>
            </select>
            <button
              className="btn btn-primary"
              style={{ height: 40, flexShrink: 0 }}
              onClick={() => setEditField(null)}
            >
              <Check size={13} /> Done
            </button>
          </div>
        </EditableRow>

        <EditableRow
          label="Company Size"
          value={
            p.companySize
              ? { "1-10": "1–10 employees", "11-50": "11–50 employees", "51-200": "51–200 employees", "201-1000": "201–1,000 employees", "1001+": "1,001+ employees" }[p.companySize] || p.companySize
              : null
          }
          editing={editField === "companySize"}
          onStart={() => setEditField("companySize")}
          onCancel={() => setEditField(null)}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select
              className="input-field"
              value={p.companySize || ""}
              onChange={(e) => update("companySize", e.target.value)}
              autoFocus
              style={{ height: 40, flex: 1 }}
            >
              <option value="">Not set</option>
              <option value="1-10">1–10 employees</option>
              <option value="11-50">11–50 employees</option>
              <option value="51-200">51–200 employees</option>
              <option value="201-1000">201–1,000 employees</option>
              <option value="1001+">1,001+ employees</option>
            </select>
            <button
              className="btn btn-primary"
              style={{ height: 40, flexShrink: 0 }}
              onClick={() => setEditField(null)}
            >
              <Check size={13} /> Done
            </button>
          </div>
        </EditableRow>

        <EditableRow
          label="Bio"
          value={p.bio}
          editing={editField === "bio"}
          onStart={() => setEditField("bio")}
          onCancel={() => setEditField(null)}
        >
          <div>
            <textarea
              className="input-field"
              value={p.bio || ""}
              onChange={(e) => update("bio", e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              autoFocus
              style={{ minHeight: 80 }}
            />
            <button
              className="btn btn-primary"
              style={{ height: 40, marginTop: 8 }}
              onClick={() => setEditField(null)}
            >
              <Check size={13} /> Done
            </button>
          </div>
        </EditableRow>
      </div>

      {/* ── Account Info ── */}
      <div className="glass card-section" style={{ marginTop: 16 }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Shield size={15} style={{ color: "var(--text-muted)" }} />
          Account Information
        </h3>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 0",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              width: 160,
              flexShrink: 0,
            }}
          >
            Member since
          </span>
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            {formatDate(p.createdAt)}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 0",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              width: 160,
              flexShrink: 0,
            }}
          >
            Account ID
          </span>
          <span
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              fontFamily: "monospace",
            }}
          >
            {truncUuid(p.id)}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 0",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              width: 160,
              flexShrink: 0,
            }}
          >
            Email verified
          </span>
          <span
            className={`badge ${p.emailVerified ? "badge-success" : "badge-danger"}`}
          >
            {p.emailVerified ? "Verified" : "Unverified"}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 0",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              width: 160,
              flexShrink: 0,
            }}
          >
            Phone verified
          </span>
          <span
            className={`badge ${p.phoneVerified ? "badge-success" : "badge-danger"}`}
          >
            {p.phoneVerified ? "Verified" : "Unverified"}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 0",
          }}
        >
          <span
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              width: 160,
              flexShrink: 0,
            }}
          >
            Last updated
          </span>
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            {formatDateTime(p.updatedAt)}
          </span>
        </div>
      </div>

      {/* ── Recent Sign-ins ── */}
      {signins.length > 0 && (
        <div className="glass card-section" style={{ marginTop: 16 }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={15} style={{ color: "var(--text-muted)" }} />
            Recent Sign-ins
          </h3>

          {signins.slice(0, 5).map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "12px 0",
                borderBottom:
                  i < Math.min(signins.length, 5) - 1
                    ? "1px solid var(--border)"
                    : "none",
              }}
            >
              <Monitor
                size={16}
                style={{
                  color: "var(--text-muted)",
                  marginTop: 2,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  New sign-in on {s.device}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    marginTop: 2,
                  }}
                >
                  {s.ip} · {s.location}
                </p>
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--text-ash)",
                  flexShrink: 0,
                  paddingTop: 2,
                }}
              >
                {formatDateTime(s.time)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Footer ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 10,
          marginTop: 24,
          paddingBottom: 40,
        }}
      >
        <button
          className="btn btn-ghost"
          onClick={() => {
            fetched.current = false;
            setEditField(null);
            fetch(`${API}/api/profile`, { credentials: "include" })
              .then((r) => (r.ok ? r.json() : null))
              .then(setP)
              .catch(() => {});
          }}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={save}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div
          className={`toast ${toast.includes("saved") || toast.includes("updated") || toast.includes("Photo") ? "toast-success" : "toast-error"}`}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
