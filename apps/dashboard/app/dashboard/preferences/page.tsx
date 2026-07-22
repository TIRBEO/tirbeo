"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Moon, Sun, Monitor, Type, Palette, LayoutGrid, Sparkles } from "lucide-react";
import { PreferencesSkeleton } from "../../components/Skeleton";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Prefs = {
  theme: string | null; language: string | null; timezone: string | null;
  dateFormat: string | null; timeFormat: string | null; fontSize: string | null;
  reduceMotion: boolean; highContrast: boolean; preferences?: Record<string, any>;
} | null;

function Toggle({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="table-row">
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, color: "#ffffff" }}>{label}</p>
        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{desc}</p>
      </div>
      <div className={`toggle ${value ? "active" : ""}`} onClick={() => onChange(!value)} />
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>{label}</label>
      <select value={value || ""} onChange={e => onChange(e.target.value)} className="input-field" style={{ cursor: "pointer" }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function applyPreferenceStyles(prefs: Prefs) {
  const root = document.documentElement;
  const accent = prefs?.preferences?.accentColor || "#ffffff";
  const shell = prefs?.preferences?.shellStyle || "dark";
  const density = prefs?.preferences?.density || "comfortable";
  const sidebarWidth = prefs?.preferences?.sidebarWidth || "wide";
  const fontScale = prefs?.preferences?.fontScale || "default";
  root.style.setProperty("--accent", accent);
  root.style.setProperty("--accent-muted", `${accent}20`);
  root.style.setProperty("--sidebar-w", sidebarWidth === "compact" ? "220px" : "260px");
  root.style.setProperty("--dashboard-density", density === "compact" ? "0.9" : density === "spacious" ? "1.05" : "1");
  root.style.setProperty("--font-scale", fontScale === "large" ? "1.02" : fontScale === "small" ? "0.96" : "1");
  if (shell === "midnight") {
    root.style.setProperty("--bg", "#05060a");
    root.style.setProperty("--bg-surface", "#0b0d12");
    root.style.setProperty("--bg-card", "#12141b");
  }
}

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<Prefs>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(`${API}/api/preferences`, { credentials: "include" }).then(r => r.ok ? r.json() : null).then((data) => {
      setPrefs(data);
      applyPreferenceStyles(data);
    }).catch(() => {});
  }, []);

  const update = useCallback((key: string, val: any) => {
    setPrefs(prev => prev ? { ...prev, [key]: val } : prev);
  }, []);

  const updateAppearance = useCallback((key: string, val: string) => {
    setPrefs(prev => prev ? { ...prev, preferences: { ...(prev.preferences || {}), [key]: val } } : prev);
  }, []);

  const save = useCallback(async () => {
    if (!prefs) return;
    setSaving(true);
    try {
      applyPreferenceStyles(prefs);
      await fetch(`${API}/api/preferences`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      setToast("Preferences saved");
    } catch { setToast("Failed to save"); }
    setSaving(false);
    setTimeout(() => setToast(null), 3000);
  }, [prefs]);

  if (!prefs) return <PreferencesSkeleton />;

  return (
    <div className="space-y-8">
      <div className="section-header flex items-center justify-between" style={{ marginBottom: 0 }}>
        <div>
          <h1>Preferences</h1>
          <p>Customize your experience and dashboard look</p>
        </div>
        <button onClick={save} disabled={saving} className="btn btn-primary" style={{ fontSize: 12 }}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="glass card-section space-y-4">
        <div className="flex items-center gap-2"><Moon size={14} style={{ color: "var(--text-muted)" }} /><h3 style={{ marginBottom: 0 }}>General</h3></div>
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>Theme</label>
          <div className="flex gap-2">
            {['light', 'dark', 'system'].map(t => (
              <button key={t} onClick={() => update('theme', t)}
                className={`btn ${prefs.theme === t ? 'btn-primary' : 'btn-ghost'}`}
                style={{ flex: 1, height: 36, textTransform: 'capitalize', fontSize: 12 }}>
                {t === 'light' ? <Sun size={13} /> : t === 'dark' ? <Moon size={13} /> : <Monitor size={13} />}
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select label="Language" value={prefs.language || "en"} onChange={v => update("language", v)} options={["en", "es", "fr", "de", "ne", "hi"]} />
          <Select label="Timezone" value={prefs.timezone || "UTC"} onChange={v => update("timezone", v)} options={["UTC", "America/New_York", "America/Los_Angeles", "Europe/London", "Asia/Kathmandu", "Asia/Kolkata", "Asia/Tokyo"]} />
          <Select label="Date Format" value={prefs.dateFormat || "MM/DD/YYYY"} onChange={v => update("dateFormat", v)} options={["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]} />
          <Select label="Time Format" value={prefs.timeFormat || "12h"} onChange={v => update("timeFormat", v)} options={["12h", "24h"]} />
        </div>
      </div>

      <div className="glass card-section space-y-4">
        <div className="flex items-center gap-2"><Palette size={14} style={{ color: "var(--text-muted)" }} /><h3 style={{ marginBottom: 0 }}>Appearance</h3></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select label="Accent color" value={prefs.preferences?.accentColor || "#ffffff"} onChange={v => updateAppearance("accentColor", v)} options={["#ffffff", "#7aa2f7", "#59d499", "#ffb347", "#f472b6"]} />
          <Select label="Shell style" value={prefs.preferences?.shellStyle || "dark"} onChange={v => updateAppearance("shellStyle", v)} options={["dark", "midnight"]} />
          <Select label="Density" value={prefs.preferences?.density || "comfortable"} onChange={v => updateAppearance("density", v)} options={["compact", "comfortable", "spacious"]} />
          <Select label="Sidebar width" value={prefs.preferences?.sidebarWidth || "wide"} onChange={v => updateAppearance("sidebarWidth", v)} options={["wide", "compact"]} />
          <Select label="Font scale" value={prefs.preferences?.fontScale || "default"} onChange={v => updateAppearance("fontScale", v)} options={["small", "default", "large"]} />
        </div>
      </div>

      <div className="glass card-section space-y-4">
        <div className="flex items-center gap-2"><Type size={14} style={{ color: "var(--text-muted)" }} /><h3 style={{ marginBottom: 0 }}>Accessibility</h3></div>
        <Select label="Font Size" value={prefs.fontSize || "default"} onChange={v => update("fontSize", v)} options={["small", "default", "large"]} />
        <Toggle label="Reduce Motion" desc="Minimize animations" value={prefs.reduceMotion} onChange={v => update("reduceMotion", v)} />
        <Toggle label="High Contrast" desc="Increase contrast for visibility" value={prefs.highContrast} onChange={v => update("highContrast", v)} />
      </div>

      {toast && <div className={`toast ${toast.includes("saved") ? "toast-success" : "toast-error"}`}>{toast}</div>}
    </div>
  );
}
