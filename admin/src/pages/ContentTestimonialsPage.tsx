import { CrudPage } from "../lib/crud"

const columns = [
  { key: "id", header: "ID", width: "80px", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.id as string).slice(0, 8)}...</code> },
  { key: "author", header: "Author" },
  { key: "role", header: "Role", render: (r: any) => <span className="text-muted-foreground text-xs">{r.role || "-"}</span> },
  { key: "quote", header: "Quote", render: (r: any) => <span className="text-muted-foreground">{(r.quote || "").slice(0, 80)}{r.quote?.length > 80 ? "..." : ""}</span> },
  { key: "rating", header: "Rating", width: "80px", render: (r: any) => r.rating ? <span className="text-amber-400">{Array(r.rating).fill("★").join("")}</span> : <span className="text-muted-foreground">-</span> },
  { key: "is_active", header: "Status", width: "100px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${r.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"}`}>{r.is_active ? "Active" : "Inactive"}</span>
  )},
]

export default function ContentTestimonialsPage() {
  return <CrudPage table="testimonials" title="Testimonials" columns={columns} searchable={["author", "role", "quote"]} orderBy="sort_order" />
}
