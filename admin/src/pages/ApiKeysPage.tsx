import { CrudPage } from "../lib/crud"

const columns = [
  { key: "id", header: "ID", width: "80px", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.id as string).slice(0, 8)}...</code> },
  { key: "name", header: "Name" },
  { key: "key_value", header: "Key", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{r.key_value ? r.key_value.slice(0, 12) + "..." : ""}</code> },
  { key: "prefix", header: "Prefix", width: "100px" },
  { key: "is_active", header: "Active", width: "100px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${r.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
      {r.is_active ? "Active" : "Inactive"}
    </span>
  )},
  { key: "created_at", header: "Created", width: "180px", render: (r: any) => new Date(r.created_at).toLocaleDateString() }
]

export default function ApiKeysPage() {
  return <CrudPage table="api_keys" title="API Keys" columns={columns} searchable={["name", "prefix"]} orderBy="created_at" />
}
