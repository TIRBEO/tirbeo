import { CrudPage } from "../lib/crud"

const columns = [
  { key: "id", header: "ID", width: "80px", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.id as string).slice(0, 8)}...</code> },
  { key: "email", header: "Email" },
  { key: "name", header: "Name" },
  { key: "is_active", header: "Status", width: "100px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${r.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"}`}>{r.is_active ? "Active" : "Inactive"}</span>
  )},
  { key: "subscribed_at", header: "Subscribed At", render: (r: any) => <span className="text-muted-foreground">{r.subscribed_at ? new Date(r.subscribed_at).toLocaleDateString() : ""}</span> },
]

export default function ContentNewsletterPage() {
  return <CrudPage table="newsletter_subscribers" title="Newsletter Subscribers" columns={columns} searchable={["email", "name"]} defaultSort={{ column: "subscribed_at", ascending: false }} />
}
