import { CrudPage } from "../lib/crud"

const columns = [
  { key: "id", header: "ID", width: "80px", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.id as string).slice(0, 8)}...</code> },
  { key: "title", header: "Title" },
  { key: "type", header: "Type", width: "120px", render: (r: any) => <span className="capitalize text-xs">{r.type}</span> },
  { key: "format", header: "Format", width: "80px", render: (r: any) => <span className="uppercase text-xs font-mono">{r.format}</span> },
  { key: "generated_at", header: "Generated", render: (r: any) => r.generated_at ? new Date(r.generated_at).toLocaleDateString() : <span className="text-muted-foreground">-</span> },
]

export default function AdminReportsPage() {
  return <CrudPage table="reports" title="Reports" columns={columns} searchable={["title", "type"]} defaultSort={{ column: "generated_at", ascending: false }} />
}
