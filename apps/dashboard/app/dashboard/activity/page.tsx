"use client";

import { useState, useEffect, useRef } from "react";
import { Activity, Clock, Filter } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Log = {
  id: string; action: string; targetType: string | null; targetId: string | null;
  metadata: any; severity: string; createdAt: string;
};

export default function ActivityPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [filter, setFilter] = useState("all");
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(`${API}/api/user/activity?limit=50`, { credentials: "include" }).then(r => r.ok ? r.json() : []).then(setLogs).catch(() => {});
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>Activity</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Your recent actions</p>
        </div>
        <div className="flex gap-1">
          {["all", "24h", "7d", "30d"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`btn ${filter === f ? "btn-primary" : "btn-ghost"}`}
              style={{ height: 32, fontSize: 12, textTransform: "capitalize" }}>
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>
      </div>

      <div className="glass" style={{ padding: "8px 0" }}>
        {Object.entries(groups).length === 0 ? (
          <div className="card-section text-center">
            <Activity size={32} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No activity found</p>
          </div>
        ) : Object.entries(groups).map(([date, items]) => (
          <div key={date}>
            <p className="text-xs font-semibold uppercase tracking-wider px-5 pt-4 pb-2" style={{ color: "var(--text-muted)" }}>{date}</p>
            {items.map(log => (
              <div key={log.id} className="table-row" style={{ padding: "12px 20px" }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: log.severity === "error" ? "var(--danger)" : log.severity === "warning" ? "#f59e0b" : "var(--text-muted)", flexShrink: 0 }} />
                  <div>
                    <p className="text-sm" style={{ color: "var(--text)" }}>{log.action}</p>
                    {log.targetType && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{log.targetType}{log.targetId ? ` · ${log.targetId.slice(0, 8)}` : ""}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{new Date(log.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
