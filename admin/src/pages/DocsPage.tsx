import { CrudPage } from "../lib/crud"

const columns = [
  { key: "id", header: "ID", width: "80px", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.id as string).slice(0, 8)}...</code> },
  { key: "slug", header: "Slug" },
  { key: "title", header: "Title" },
  { key: "category", header: "Category", width: "140px", render: (r: any) => (
    <span className="inline-flex rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400">{r.category || "-"}</span>
  )},
  { key: "published", header: "Status", width: "100px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${r.published ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
      {r.published ? "Published" : "Draft"}
    </span>
  )},
  { key: "created_at", header: "Created", width: "180px", render: (r: any) => new Date(r.created_at).toLocaleDateString() }
]

export default function DocsPage() {
  return <CrudPage table="blog_posts" title="Documentation" columns={columns} searchable={["slug", "title", "category"]} orderBy="created_at" />
}
