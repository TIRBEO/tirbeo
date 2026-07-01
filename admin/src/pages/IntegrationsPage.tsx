import { CrudPage } from "../lib/crud"

const columns = [
  { key: "id", header: "ID", width: "80px", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.id as string).slice(0, 8)}...</code> },
  { key: "name", header: "Name" },
  { key: "type", header: "Type", width: "120px", render: (r: any) => (
    <span className="inline-flex rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400">{r.type}</span>
  )},
  { key: "is_connected", header: "Connected", width: "120px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${r.is_connected ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
      {r.is_connected ? "Connected" : "Disconnected"}
    </span>
  )},
  { key: "created_at", header: "Created", width: "180px", render: (r: any) => new Date(r.created_at).toLocaleDateString() }
]

export default function IntegrationsPage() {
  return <CrudPage table="integrations" title="Integrations" columns={columns} searchable={["name", "type"]} orderBy="created_at" />
}
