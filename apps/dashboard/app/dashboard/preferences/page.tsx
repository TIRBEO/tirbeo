"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Settings, Moon, Sun, Monitor, Type, Eye } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Prefs = {
  theme: string | null; language: string | null; timezone: string | null;
  dateFormat: string | null; timeFormat: string | null; fontSize: string | null;
  reduceMotion: boolean; highContrast: boolean;
} | null;

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<Prefs>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(`${API}/api/preferences`, { credentials: "include" }).then(r => r.ok ? r.json() : null).then(setPrefs).catch(() => {});
  }, []);

  const update = (key: string, val: any) => { if (prefs) setPrefs({ ...prefs, [key]: val }); };

  const save = useCallback(async () => {
    if (!prefs) return;
    setSaving(true);
    try {
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

  if (!prefs) return null;

  const Toggle = ({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) => (
    <div className="table-row">
      <div>
        <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{label}</p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{desc}</p>
      </div>
      <div className={`toggle ${value ? "active" : ""}`} onClick={() => onChange(!value)} />
    </div>
  );

  const Select = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) => (
    <div>
      <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</label>
      <select value={value || ""} onChange={e => onChange(e.target.value)} className="input-field" style={{ cursor: "pointer" }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>Preferences</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Customize your experience</p>
        </div>
        <button onClick={save} disabled={saving} className="btn btn-primary">{saving ? "Saving..." : "Save"}</button>
      </div>

      <div className="glass card-section space-y-4">
        <div className="flex items-center gap-2"><Moon size={16} style={{ color: "var(--text-muted)" }} /><h3 style={{ marginBottom: 0 }}>General</h3></div>
        <div>
          <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Theme</label>
          <div className="flex gap-2">
            {["light", "dark", "system"].map(t => (
              <button key={t} onClick={() => update("theme", t)}
                className={`btn ${prefs.theme === t ? "btn-primary" : "btn-ghost"}`}
                style={{ flex: 1, height: 40, textTransform: "capitalize" }}>
                {t === "light" ? <Sun size={14} /> : t === "dark" ? <Moon size={14} /> : <Monitor size={14} />}
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Language" value={prefs.language || "en"} onChange={v => update("language", v)} options={["en", "es", "fr", "de", "ne", "hi"]} />
          <Select label="Timezone" value={prefs.timezone || "UTC"} onChange={v => update("timezone", v)} options={["UTC", "America/New_York", "America/Los_Angeles", "Europe/London", "Asia/Kathmandu", "Asia/Kolkata", "Asia/Tokyo"]} />
          <Select label="Date Format" value={prefs.dateFormat || "MM/DD/YYYY"} onChange={v => update("dateFormat", v)} options={["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]} />
          <Select label="Time Format" value={prefs.timeFormat || "12h"} onChange={v => update("timeFormat", v)} options={["12h", "24h"]} />
        </div>
      </div>

      <div className="glass card-section space-y-4">
        <div className="flex items-center gap-2"><Type size={16} style={{ color: "var(--text-muted)" }} /><h3 style={{ marginBottom: 0 }}>Accessibility</h3></div>
        <Select label="Font Size" value={prefs.fontSize || "default"} onChange={v => update("fontSize", v)} options={["small", "default", "large"]} />
        <Toggle label="Reduce Motion" desc="Minimize animations throughout the interface" value={prefs.reduceMotion} onChange={v => update("reduceMotion", v)} />
        <Toggle label="High Contrast" desc="Increase contrast for better visibility" value={prefs.highContrast} onChange={v => update("highContrast", v)} />
      </div>

      {toast && <div className={`toast ${toast.includes("saved") ? "toast-success" : "toast-error"}`}>{toast}</div>}
    </div>
  );
}
