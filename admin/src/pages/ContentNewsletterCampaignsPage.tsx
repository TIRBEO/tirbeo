import { CrudPage } from "../lib/crud"

const statusStyles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-blue-500/10 text-blue-400",
  sending: "bg-amber-500/10 text-amber-400",
  sent: "bg-emerald-500/10 text-emerald-400",
  failed: "bg-red-500/10 text-red-400",
}

const columns = [
  { key: "id", header: "ID", width: "80px", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.id as string).slice(0, 8)}...</code> },
  { key: "subject", header: "Subject" },
  { key: "status", header: "Status", width: "100px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[r.status] || "bg-muted text-muted-foreground"}`}>{r.status}</span>
  )},
  { key: "recipient_count", header: "Recipients", width: "100px" },
  { key: "scheduled_at", header: "Scheduled", render: (r: any) => r.scheduled_at ? new Date(r.scheduled_at).toLocaleDateString() : <span className="text-muted-foreground">-</span> },
  { key: "sent_at", header: "Sent At", render: (r: any) => r.sent_at ? new Date(r.sent_at).toLocaleDateString() : <span className="text-muted-foreground">-</span> },
]

export default function ContentNewsletterCampaignsPage() {
  return <CrudPage table="newsletter_campaigns" title="Newsletter Campaigns" columns={columns} searchable={["subject", "content"]} defaultSort={{ column: "created_at", ascending: false }} />
}
