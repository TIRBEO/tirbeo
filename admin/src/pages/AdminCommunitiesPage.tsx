import { CrudPage } from "../lib/crud"

const columns = [
  { key: "id", header: "ID", width: "80px", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.id as string).slice(0, 8)}...</code> },
  { key: "name", header: "Name" },
  { key: "slug", header: "Slug", render: (r: any) => <span className="text-muted-foreground font-mono text-xs">{r.slug}</span> },
  { key: "description", header: "Description", render: (r: any) => <span className="text-muted-foreground">{(r.description || "").slice(0, 60)}</span> },
  { key: "is_private", header: "Type", width: "90px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${r.is_private ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"}`}>{r.is_private ? "Private" : "Public"}</span>
  )},
  { key: "member_count", header: "Members", width: "90px" },
]

export default function AdminCommunitiesPage() {
  return <CrudPage table="communities" title="Communities" columns={columns} searchable={["name", "slug", "description"]} orderBy="created_at desc" />
}
