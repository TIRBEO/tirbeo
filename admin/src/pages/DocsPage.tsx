import { CrudPage } from "../lib/crud"

const columns = [
  { key: "id", header: "ID", width: "80px", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.id as string).slice(0, 8)}...</code> },
  { key: "title", header: "Title" },
  { key: "slug", header: "Slug", render: (r: any) => <span className="text-muted-foreground font-mono text-xs">/{r.slug}</span> },
  { key: "category_id", header: "Category", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.category_id || "").slice(0, 8)}...</code> },
  { key: "is_published", header: "Status", width: "100px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${r.is_published ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"}`}>{r.is_published ? "Published" : "Draft"}</span>
  )},
  { key: "created_at", header: "Created", width: "160px", render: (r: any) => new Date(r.created_at).toLocaleDateString() },
]

export default function DocsPage() {
  return <CrudPage table="doc_articles" title="Documentation" columns={columns} searchable={["title", "slug", "content"]} orderBy="created_at desc" />
}
