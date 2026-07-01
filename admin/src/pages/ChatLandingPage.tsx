import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"
import { CrudPage } from "../lib/crud"

const marqueeColumns = [
  { key: "id", header: "ID", width: "80px", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.id as string).slice(0, 8)}...</code> },
  { key: "name", header: "Name" },
  { key: "logo_url", header: "Logo URL", render: (r: any) => r.logo_url ? <a href={r.logo_url} target="_blank" rel="noopener" className="text-primary hover:underline text-sm truncate block max-w-xs">{r.logo_url}</a> : <span className="text-muted-foreground">-</span> },
  { key: "sort_order", header: "Order", width: "80px" },
  { key: "is_active", header: "Active", width: "100px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${r.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
      {r.is_active ? "Active" : "Inactive"}
    </span>
  )}
]

const statsColumns = [
  { key: "id", header: "ID", width: "80px", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.id as string).slice(0, 8)}...</code> },
  { key: "label", header: "Label" },
  { key: "value", header: "Value" },
  { key: "suffix", header: "Suffix", width: "100px" },
  { key: "sort_order", header: "Order", width: "80px" },
  { key: "is_active", header: "Active", width: "100px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${r.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
      {r.is_active ? "Active" : "Inactive"}
    </span>
  )}
]

const announcementsColumns = [
  { key: "id", header: "ID", width: "80px", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.id as string).slice(0, 8)}...</code> },
  { key: "title", header: "Title" },
  { key: "type", header: "Type", width: "100px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
      r.type === "info" ? "bg-blue-500/10 text-blue-400" :
      r.type === "warning" ? "bg-amber-500/10 text-amber-400" :
      r.type === "success" ? "bg-emerald-500/10 text-emerald-400" :
      "bg-red-500/10 text-red-400"
    }`}>{r.type}</span>
  )},
  { key: "is_active", header: "Active", width: "100px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${r.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
      {r.is_active ? "Active" : "Inactive"}
    </span>
  )},
  { key: "created_at", header: "Created", width: "180px", render: (r: any) => new Date(r.created_at).toLocaleDateString() }
]

export default function ChatLandingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground tracking-tight">Content Manager</h1>
      <Tabs defaultValue="marquee">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="marquee">Marquee Logos</TabsTrigger>
          <TabsTrigger value="stats">Landing Stats</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>
        <TabsContent value="marquee">
          <div className="mt-4">
            <CrudPage table="marquee_logos" title="Marquee Logos" columns={marqueeColumns} searchable={["name"]} orderBy="sort_order" />
          </div>
        </TabsContent>
        <TabsContent value="stats">
          <div className="mt-4">
            <CrudPage table="landing_stats" title="Landing Stats" columns={statsColumns} searchable={["label", "value"]} orderBy="sort_order" />
          </div>
        </TabsContent>
        <TabsContent value="announcements">
          <div className="mt-4">
            <CrudPage table="announcements" title="Announcements" columns={announcementsColumns} searchable={["title"]} orderBy="created_at" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
