import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"
import { CrudPage } from "../lib/crud"

const pageColumns = [
  { key: "id", header: "ID", width: "80px", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.id as string).slice(0, 8)}...</code> },
  { key: "slug", header: "Slug", render: (r: any) => <span className="text-muted-foreground font-mono text-xs">/{r.slug}</span> },
  { key: "title", header: "Title" },
  { key: "is_published", header: "Status", width: "100px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${r.is_published ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"}`}>{r.is_published ? "Published" : "Draft"}</span>
  )},
]

const sectionColumns = [
  { key: "id", header: "ID", width: "80px", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.id as string).slice(0, 8)}...</code> },
  { key: "page_slug", header: "Page", render: (r: any) => <span className="text-muted-foreground font-mono text-xs">{r.page_slug}</span> },
  { key: "type", header: "Type", width: "110px", render: (r: any) => <span className="capitalize text-xs bg-muted/30 px-2 py-1 rounded-lg">{r.type}</span> },
  { key: "title", header: "Title" },
  { key: "is_active", header: "Status", width: "100px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${r.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"}`}>{r.is_active ? "Active" : "Inactive"}</span>
  )},
  { key: "sort_order", header: "Order", width: "80px" },
]

export default function ContentPagesSectionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground tracking-tight">Page Builder</h1>
      <Tabs defaultValue="pages">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
        </TabsList>
        <TabsContent value="pages">
          <div className="mt-4">
            <CrudPage table="pages" title="Landing Pages" columns={pageColumns} searchable={["slug", "title"]} orderBy="created_at desc" />
          </div>
        </TabsContent>
        <TabsContent value="sections">
          <div className="mt-4">
            <CrudPage table="sections" title="Page Sections" columns={sectionColumns} searchable={["title", "subtitle", "type", "page_slug"]} orderBy="sort_order" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
