import { CrudPage } from "../lib/crud"

const columns = [
  { key: "id", header: "ID", width: "80px", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.id as string).slice(0, 8)}...</code> },
  { key: "slug", header: "Slug" },
  { key: "title", header: "Title" },
  { key: "published_at", header: "Published", width: "140px", render: (r: any) => r.published_at ? new Date(r.published_at).toLocaleDateString() : <span className="text-muted-foreground">Draft</span> },
  { key: "is_published", header: "Status", width: "100px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${r.is_published ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
      {r.is_published ? "Published" : "Draft"}
    </span>
  )},
  { key: "author_name", header: "Author", width: "140px" },
  { key: "created_at", header: "Created", width: "180px", render: (r: any) => new Date(r.created_at).toLocaleDateString() }
]

export default function LandingPagesPage() {
  return <CrudPage table="blog_posts" title="Blog Posts" columns={columns} searchable={["slug", "title", "author_name"]} orderBy="created_at" />
}
