"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Plug, Link2, Unlink } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Integration = { id: string; provider: string; connected: boolean; createdAt: string };

const PROVIDERS = [
  { id: "google", name: "Google", color: "#4285f4" },
  { id: "github", name: "GitHub", color: "#fff" },
  { id: "slack", name: "Slack", color: "#e01e5a" },
  { id: "discord", name: "Discord", color: "#5865f2" },
  { id: "zapier", name: "Zapier", color: "#ff4a00" },
  { id: "notion", name: "Notion", color: "#fff" },
  { id: "linear", name: "Linear", color: "#5e6ad2" },
  { id: "figma", name: "Figma", color: "#a259ff" },
  { id: "openai", name: "OpenAI", color: "#10a37f" },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(`${API}/api/integrations`, { credentials: "include" }).then(r => r.ok ? r.json() : []).then(setIntegrations).catch(() => {});
  }, []);

  const isConnected = (id: string) => integrations.some(i => i.provider === id && i.connected);

  const toggle = useCallback(async (provider: string, connected: boolean) => {
    setLoading(provider);
    try {
      if (connected) {
        await fetch(`${API}/api/integrations`, {
          method: "DELETE", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider }),
        });
        setIntegrations(prev => prev.filter(i => i.provider !== provider));
      } else {
        const res = await fetch(`${API}/api/integrations`, {
          method: "POST", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider, connected: true }),
        });
        if (res.ok) { const data = await res.json(); setIntegrations(prev => [...prev, data]); }
      }
      setToast(connected ? `${provider} disconnected` : `${provider} connected`);
    } catch { setToast("Failed"); }
    setLoading(null);
    setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>Integrations</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Connected apps and services</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PROVIDERS.map(p => {
          const connected = isConnected(p.id);
          return (
            <div key={p.id} className="glass" style={{ padding: "18px 20px" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: p.color }}>
                    {p.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{p.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{connected ? "Connected" : "Not connected"}</p>
                  </div>
                </div>
                <span className={`badge ${connected ? "badge-success" : "badge-default"}`}>{connected ? "Active" : "Inactive"}</span>
              </div>
              <button onClick={() => toggle(p.id, connected)} disabled={loading === p.id}
                className={`btn ${connected ? "btn-danger" : "btn-primary"} w-full`} style={{ height: 34, fontSize: 12 }}>
                {loading === p.id ? "..." : connected ? <><Unlink size={12} />Disconnect</> : <><Link2 size={12} />Connect</>}
              </button>
            </div>
          );
        })}
      </div>

      {toast && <div className="toast toast-success">{toast}</div>}
    </div>
  );
}
