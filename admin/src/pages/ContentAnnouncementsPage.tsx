import { CrudPage } from "../lib/crud"

const typeStyles: Record<string, string> = {
  info: "bg-blue-500/10 text-blue-400",
  warning: "bg-amber-500/10 text-amber-400",
  success: "bg-emerald-500/10 text-emerald-400",
  error: "bg-red-500/10 text-red-400",
}

const columns = [
  { key: "id", header: "ID", width: "80px", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.id as string).slice(0, 8)}...</code> },
  { key: "title", header: "Title" },
  { key: "type", header: "Type", width: "100px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${typeStyles[r.type] || "bg-muted text-muted-foreground"}`}>{r.type}</span>
  )},
  { key: "is_published", header: "Status", width: "110px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${r.is_published ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"}`}>{r.is_published ? "Published" : "Draft"}</span>
  )},
  { key: "published_at", header: "Published At", render: (r: any) => <span className="text-muted-foreground">{r.published_at ? new Date(r.published_at).toLocaleDateString() : ""}</span> },
]

export default function ContentAnnouncementsPage() {
  return <CrudPage table="announcements" title="Announcements" columns={columns} searchable={["title", "content"]} orderBy="created_at desc" />
}
