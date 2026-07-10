"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Building2, Users, Plus, Trash2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Workspace = {
  id: string; name: string; slug: string; createdAt: string;
  owner: { id: string; name: string | null; email: string };
  _count: { memberships: number };
};

export default function WorkspacePage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(`${API}/api/workspaces`, { credentials: "include" }).then(r => r.ok ? r.json() : []).then(setWorkspaces).catch(() => {});
  }, []);

  const create = useCallback(async () => {
    if (!name || !slug) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/workspaces`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });
      if (res.ok) {
        const ws = await res.json();
        setWorkspaces(prev => [ws, ...prev]);
        setShowCreate(false); setName(""); setSlug("");
        setToast("Workspace created");
      } else setToast(await res.text() || "Failed");
    } catch { setToast("Connection error"); }
    setLoading(false);
    setTimeout(() => setToast(null), 3000);
  }, [name, slug]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>Workspace</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Manage your organizations</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary">
          <Plus size={14} />New Workspace
        </button>
      </div>

      {showCreate && (
        <div className="glass card-section space-y-4 animate-in">
          <h3>Create Workspace</h3>
          <input placeholder="Workspace name" value={name} onChange={e => { setName(e.target.value); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")); }} className="input-field" />
          <input placeholder="slug" value={slug} onChange={e => setSlug(e.target.value)} className="input-field" />
          <div className="flex gap-2">
            <button onClick={create} disabled={loading} className="btn btn-primary">{loading ? "Creating..." : "Create"}</button>
            <button onClick={() => setShowCreate(false)} className="btn btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {workspaces.length === 0 && (
          <div className="glass card-section text-center">
            <Building2 size={32} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No workspaces yet. Create one to get started.</p>
          </div>
        )}
        {workspaces.map(ws => (
          <div key={ws.id} className="glass" style={{ padding: "18px 20px" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="avatar" style={{ width: 40, height: 40, fontSize: 14 }}>{ws.name[0].toUpperCase()}</div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{ws.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>/{ws.slug} · {ws._count.memberships} member{ws._count.memberships !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <span className="badge badge-default">Owner</span>
            </div>
          </div>
        ))}
      </div>

      {toast && <div className={`toast ${toast.includes("created") ? "toast-success" : "toast-error"}`}>{toast}</div>}
    </div>
  );
}
