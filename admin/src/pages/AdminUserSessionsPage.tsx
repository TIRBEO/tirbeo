import { CrudPage } from "../lib/crud"

const columns = [
  { key: "id", header: "ID", width: "80px", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.id as string).slice(0, 8)}...</code> },
  { key: "user_id", header: "User ID", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.user_id || "").slice(0, 8)}...</code> },
  { key: "device", header: "Device", render: (r: any) => <span className="text-muted-foreground text-xs">{r.device || r.device_type || "Unknown"}</span> },
  { key: "ip_address", header: "IP", render: (r: any) => <span className="font-mono text-xs text-muted-foreground">{r.ip_address || "-"}</span> },
  { key: "is_current", header: "Status", width: "100px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${r.is_current || r.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"}`}>{r.is_current || r.is_active ? "Active" : "Ended"}</span>
  )},
  { key: "last_active_at", header: "Last Active", render: (r: any) => r.last_active_at ? new Date(r.last_active_at).toLocaleDateString() : "-" },
]

export default function AdminUserSessionsPage() {
  return <CrudPage table="user_sessions" title="User Sessions" columns={columns} searchable={["device", "ip_address", "location"]} defaultSort={{ column: "last_active_at", ascending: false }} />
}
