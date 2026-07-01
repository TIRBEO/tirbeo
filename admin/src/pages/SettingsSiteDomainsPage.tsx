import { CrudPage } from "../lib/crud"

const columns = [
  { key: "id", header: "ID", width: "80px", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.id as string).slice(0, 8)}...</code> },
  { key: "site_id", header: "Site ID", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.site_id || "").slice(0, 8)}...</code> },
  { key: "domain", header: "Domain", render: (r: any) => <span className="font-mono text-xs text-primary">{r.domain}</span> },
  { key: "is_primary", header: "Primary", width: "90px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${r.is_primary ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"}`}>{r.is_primary ? "Primary" : "Alias"}</span>
  )},
  { key: "verified", header: "Verified", width: "90px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${r.verified ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>{r.verified ? "Verified" : "Pending"}</span>
  )},
]

export default function SettingsSiteDomainsPage() {
  return <CrudPage table="site_domains" title="Site Domains" columns={columns} searchable={["domain"]} orderBy="created_at desc" />
}
