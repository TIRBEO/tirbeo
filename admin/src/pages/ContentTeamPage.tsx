import { CrudPage } from "../lib/crud"

const columns = [
  { key: "id", header: "ID", width: "80px", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.id as string).slice(0, 8)}...</code> },
  { key: "name", header: "Name" },
  { key: "role", header: "Role" },
  { key: "bio", header: "Bio", render: (r: any) => <span className="text-muted-foreground">{(r.bio || "").slice(0, 60)}{r.bio?.length > 60 ? "..." : ""}</span> },
  { key: "is_active", header: "Status", width: "100px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${r.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"}`}>{r.is_active ? "Active" : "Inactive"}</span>
  )},
  { key: "sort_order", header: "Order", width: "80px" },
]

export default function ContentTeamPage() {
  return <CrudPage table="team_members" title="Team Members" columns={columns} searchable={["name", "role", "bio"]} orderBy="sort_order" />
}
