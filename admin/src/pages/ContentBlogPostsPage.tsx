import { CrudPage } from "../lib/crud"

const columns = [
  { key: "id", header: "ID", width: "80px", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.id as string).slice(0, 8)}...</code> },
  { key: "title", header: "Title" },
  { key: "slug", header: "Slug", render: (r: any) => <span className="text-muted-foreground font-mono text-xs">/{r.slug}</span> },
  { key: "author_name", header: "Author", width: "120px" },
  { key: "is_published", header: "Status", width: "100px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${r.is_published ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"}`}>{r.is_published ? "Published" : "Draft"}</span>
  )},
  { key: "published_at", header: "Published", render: (r: any) => r.published_at ? new Date(r.published_at).toLocaleDateString() : <span className="text-muted-foreground">-</span> },
]

export default function ContentBlogPostsPage() {
  return <CrudPage table="blog_posts" title="Blog Posts" columns={columns} searchable={["title", "slug", "author_name", "excerpt"]} orderBy="created_at desc" />
}
