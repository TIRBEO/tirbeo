"use client";

import { useState, useEffect, useRef } from "react";
import { FileText } from "lucide-react";
import { ActivitySkeleton } from "../../components/Skeleton";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Log = {
  id: string; action: string; targetType: string | null; targetId: string | null;
  metadata: any; severity: string; createdAt: string;
};

export default function ActivityPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(`${API}/api/user/activity?limit=50`, { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter(l => {
    if (filter === "all") return true;
    const d = new Date(l.createdAt);
    const now = new Date();
    if (filter === "24h") return now.getTime() - d.getTime() < 86400000;
    if (filter === "7d") return now.getTime() - d.getTime() < 604800000;
    if (filter === "30d") return now.getTime() - d.getTime() < 2592000000;
    return true;
  });

  const groups = filtered.reduce<Record<string, Log[]>>((acc, log) => {
    const d = new Date(log.createdAt);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    let key = d.toLocaleDateString();
    if (d.toDateString() === today.toDateString()) key = "Today";
    else if (d.toDateString() === yesterday.toDateString()) key = "Yesterday";
    (acc[key] = acc[key] || []).push(log);
    return acc;
  }, {});

  if (loading) return <ActivitySkeleton />;

  return (
    <div className="space-y-8">
      <div className="section-header flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: 0 }}>
        <div>
          <h1>Activity</h1>
          <p>Your recent actions</p>
        </div>
        <div className="flex gap-1.5">
          {["all", "24h", "7d", "30d"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`btn ${filter === f ? "btn-primary" : "btn-ghost"}`}
              style={{ height: 30, fontSize: 11, textTransform: "capitalize" }}>
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>
      </div>

      <div className="glass" style={{ padding: "6px 0" }}>
        {Object.entries(groups).length === 0 ? (
          <div className="card-section text-center">
            <FileText size={28} style={{ color: "var(--text-muted)", margin: "0 auto 10px" }} />
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No activity found</p>
          </div>
        ) : Object.entries(groups).map(([date, items]) => (
          <div key={date}>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", padding: "12px 18px 6px" }}>{date}</p>
            {items.map(log => (
              <div key={log.id} className="table-row" style={{ padding: "10px 18px" }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: log.severity === "error" ? "rgba(255,255,255,0.5)" : log.severity === "warning" ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)", flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 13, color: "#ffffff" }}>{log.action}</p>
                    {log.targetType && <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{log.targetType}{log.targetId ? ` · ${log.targetId.slice(0, 8)}` : ""}</p>}
                  </div>
                </div>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{new Date(log.createdAt).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
