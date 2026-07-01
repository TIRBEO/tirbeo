import { CrudPage } from "../lib/crud"

const typeStyles: Record<string, string> = {
  info: "bg-blue-500/10 text-blue-400",
  warning: "bg-amber-500/10 text-amber-400",
  success: "bg-emerald-500/10 text-emerald-400",
  error: "bg-red-500/10 text-red-400",
}

const columns = [
  { key: "id", header: "ID", width: "80px", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.id as string).slice(0, 8)}...</code> },
  { key: "type", header: "Type", width: "90px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${typeStyles[r.type] || "bg-muted text-muted-foreground"}`}>{r.type}</span>
  )},
  { key: "title", header: "Title" },
  { key: "message", header: "Message", render: (r: any) => <span className="text-muted-foreground">{(r.message || "").slice(0, 60)}</span> },
  { key: "is_read", header: "Read", width: "80px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${r.is_read ? "bg-muted text-muted-foreground" : "bg-emerald-500/10 text-emerald-400"}`}>{r.is_read ? "Read" : "New"}</span>
  )},
  { key: "created_at", header: "Created", render: (r: any) => new Date(r.created_at).toLocaleDateString() },
]

export default function AdminNotificationsPage() {
  return <CrudPage table="notifications" title="Notifications" columns={columns} searchable={["title", "message"]} defaultSort={{ column: "created_at", ascending: false }} />
}
