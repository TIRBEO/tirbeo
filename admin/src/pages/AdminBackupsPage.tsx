import { CrudPage } from "../lib/crud"

const statusStyles: Record<string, string> = {
  completed: "bg-emerald-500/10 text-emerald-400",
  running: "bg-blue-500/10 text-blue-400",
  failed: "bg-red-500/10 text-red-400",
  pending: "bg-amber-500/10 text-amber-400",
}

const columns = [
  { key: "id", header: "ID", width: "80px", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.id as string).slice(0, 8)}...</code> },
  { key: "name", header: "Name" },
  { key: "type", header: "Type", width: "100px", render: (r: any) => <span className="capitalize text-xs">{r.type}</span> },
  { key: "size_bytes", header: "Size", render: (r: any) => r.size_bytes ? <span className="text-muted-foreground">{(r.size_bytes / 1024 / 1024).toFixed(1)} MB</span> : <span className="text-muted-foreground">-</span> },
  { key: "status", header: "Status", width: "100px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[r.status] || "bg-muted text-muted-foreground"}`}>{r.status}</span>
  )},
  { key: "created_at", header: "Created", render: (r: any) => new Date(r.created_at).toLocaleDateString() },
]

export default function AdminBackupsPage() {
  return <CrudPage table="backups" title="Backups" columns={columns} searchable={["name", "type"]} defaultSort={{ column: "created_at", ascending: false }} />
}
