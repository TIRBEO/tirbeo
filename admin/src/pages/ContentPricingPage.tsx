import { CrudPage } from "../lib/crud"

const columns = [
  { key: "id", header: "ID", width: "80px", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.id as string).slice(0, 8)}...</code> },
  { key: "name", header: "Name" },
  { key: "price", header: "Price", render: (r: any) => <span className="font-mono">${r.price}/{r.interval}</span> },
  { key: "highlighted", header: "Highlight", width: "100px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${r.highlighted ? "bg-amber-500/10 text-amber-400" : "bg-muted text-muted-foreground"}`}>{r.highlighted ? "Featured" : "Standard"}</span>
  )},
  { key: "is_active", header: "Status", width: "100px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${r.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"}`}>{r.is_active ? "Active" : "Inactive"}</span>
  )},
  { key: "sort_order", header: "Order", width: "80px" },
]

export default function PricingPage() {
  return <CrudPage table="pricing_plans" title="Pricing Plans" columns={columns} searchable={["name", "description"]} orderBy="sort_order" />
}
