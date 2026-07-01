import { CrudPage } from "../lib/crud"

const columns = [
  { key: "id", header: "ID", width: "80px", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.id as string).slice(0, 8)}...</code> },
  { key: "name", header: "App Name" },
  { key: "label", header: "Label" },
  { key: "is_enabled", header: "Status", width: "110px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${r.is_enabled ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"}`}>{r.is_enabled ? "Enabled" : "Disabled"}</span>
  )},
  { key: "icon", header: "Icon" },
  { key: "sort_order", header: "Order", width: "80px" },
]

export default function ContentAppsPage() {
  return <CrudPage table="app_configs" title="Apps Manager" columns={columns} searchable={["name", "label"]} orderBy="sort_order" />
}
