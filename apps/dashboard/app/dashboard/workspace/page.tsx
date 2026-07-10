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
      if (r.ok) {
        const data = await r.json();
        setWorkspaces(Array.isArray(data) ? data : []);
      } else {
        setWorkspaces([]);
      }
    } catch {
      setWorkspaces([]);
    }
  }, []);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    loadWorkspaces();
  }, [loadWorkspaces]);

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
        setShowCreate(false); setName(""); setSlug("");
        setToast("Workspace created");
        await loadWorkspaces();
      } else {
        const text = await res.text();
        setToast(text || "Failed to create workspace");
      }
    } catch {
      setToast("Connection error");
    }
    setLoading(false);
    setTimeout(() => setToast(null), 3000);
  }, [name, slug, loadWorkspaces]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Delete this workspace? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API}/api/workspaces/${id}`, {
        method: "DELETE", credentials: "include",
      });
      if (res.ok) {
        setWorkspaces(prev => prev.filter(w => w.id !== id));
        setToast("Workspace deleted");
      } else {
        setToast("Failed to delete");
      }
    } catch {
      setToast("Connection error");
    }
    setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#F2EEE8" }}>Workspaces</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6b8a7a" }}>Manage your organizations and teams</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary">
          <Plus size={14} /> New Workspace
        </button>
      </div>

      {showCreate && (
        <div className="glass card-section space-y-4 animate-in">
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#F2EEE8", margin: 0 }}>Create Workspace</h3>
          <input
            placeholder="Workspace name"
            value={name}
            onChange={e => {
              setName(e.target.value);
              setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
            }}
            className="input-field"
          />
          <input
            placeholder="workspace-slug"
            value={slug}
            onChange={e => setSlug(e.target.value)}
            className="input-field"
          />
          <div className="flex gap-2" style={{ display: "flex", gap: 8 }}>
            <button onClick={create} disabled={loading} className="btn btn-primary">
              {loading ? "Creating..." : "Create"}
            </button>
            <button onClick={() => setShowCreate(false)} className="btn btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {workspaces.length === 0 && (
          <div className="glass" style={{ padding: "40px 24px", textAlign: "center" }}>
            <Building2 size={32} style={{ color: "#6b8a7a", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 14, color: "#6b8a7a" }}>No workspaces yet. Create one to get started.</p>
          </div>
        )}
        {workspaces.map(ws => (
          <div key={ws.id} className="glass" style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="avatar" style={{ width: 40, height: 40, fontSize: 14 }}>
                  {ws.name[0]?.toUpperCase() || "W"}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#F2EEE8" }}>{ws.name}</p>
                  <p style={{ fontSize: 12, color: "#6b8a7a" }}>
                    /{ws.slug} · {ws._count?.memberships ?? 0} member{(ws._count?.memberships ?? 0) !== 1 ? "s" : ""}
                    {ws.owner && <span> · Owner: {ws.owner.name || ws.owner.email}</span>}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span className="badge badge-default">
                  <Users size={11} style={{ marginRight: 4 }} />
                  {ws._count?.memberships ?? 0}
                </span>
                <button
                  onClick={() => handleDelete(ws.id)}
                  className="btn btn-danger"
                  style={{ height: 32, padding: "0 10px", fontSize: 12 }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {toast && (
        <div className={`toast ${toast.includes("created") || toast.includes("deleted") ? "toast-success" : "toast-error"}`}>
          {toast}
        </div>
      )}
    </div>
  );
}
