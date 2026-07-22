"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Building2, Plus, Trash2, Users } from "lucide-react";

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

  const loadWorkspaces = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/workspaces`, { credentials: "include" });
      if (r.ok) { const data = await r.json(); setWorkspaces(Array.isArray(data) ? data : []); }
      else setWorkspaces([]);
    } catch { setWorkspaces([]); }
  }, []);

  useEffect(() => { if (!fetched.current) { fetched.current = true; loadWorkspaces(); } }, [loadWorkspaces]);

  const create = useCallback(async () => {
    if (!name || !slug) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/workspaces`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });
      if (res.ok) { setShowCreate(false); setName(""); setSlug(""); setToast("Workspace created"); await loadWorkspaces(); }
      else { const text = await res.text(); setToast(text || "Failed"); }
    } catch { setToast("Connection error"); }
    setLoading(false);
    setTimeout(() => setToast(null), 3000);
  }, [name, slug, loadWorkspaces]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Delete this workspace?")) return;
    try {
      const res = await fetch(`${API}/api/workspaces/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) { setWorkspaces(prev => prev.filter(w => w.id !== id)); setToast("Deleted"); }
      else setToast("Failed to delete");
    } catch { setToast("Connection error"); }
    setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <div className="space-y-8">
      <div className="section-header flex items-center justify-between" style={{ marginBottom: 0 }}>
        <div>
          <h1>Workspaces</h1>
          <p>Manage your organizations and teams</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary">
          <Plus size={13} /> New
        </button>
      </div>

      {showCreate && (
        <div className="glass card-section space-y-3 animate-in">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: 0 }}>Create Workspace</h3>
          <input placeholder="Workspace name" value={name}
            onChange={e => { setName(e.target.value); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")); }}
            className="input-field" />
          <input placeholder="workspace-slug" value={slug} onChange={e => setSlug(e.target.value)} className="input-field" />
          <div className="flex gap-2">
            <button onClick={create} disabled={loading} className="btn btn-primary">{loading ? "Creating..." : "Create"}</button>
            <button onClick={() => setShowCreate(false)} className="btn btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        {workspaces.length === 0 && (
          <div className="glass" style={{ padding: "36px 20px", textAlign: "center" }}>
            <Building2 size={28} style={{ color: "var(--text-muted)", margin: "0 auto 10px" }} />
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No workspaces yet</p>
          </div>
        )}
        {workspaces.map(ws => (
          <div key={ws.id} className="glass" style={{ padding: "14px 18px" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="avatar" style={{ width: 36, height: 36, fontSize: 13, borderRadius: 10 }}>
                  {ws.name[0]?.toUpperCase() || "W"}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#ffffff" }}>{ws.name}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    /{ws.slug} · {ws._count?.memberships ?? 0} member{(ws._count?.memberships ?? 0) !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge badge-default">
                  <Users size={10} style={{ marginRight: 3 }} />
                  {ws._count?.memberships ?? 0}
                </span>
                <button onClick={() => handleDelete(ws.id)} className="btn btn-danger" style={{ height: 30, padding: "0 8px" }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {toast && <div className={`toast ${toast.includes("created") || toast.includes("Deleted") ? "toast-success" : "toast-error"}`}>{toast}</div>}
    </div>
  );
}
