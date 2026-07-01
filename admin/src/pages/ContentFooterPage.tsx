import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"
import { CrudPage } from "../lib/crud"

const sectionColumns = [
  { key: "id", header: "ID", width: "80px", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.id as string).slice(0, 8)}...</code> },
  { key: "title", header: "Section Title" },
  { key: "sort_order", header: "Order", width: "80px" },
]

const linkColumns = [
  { key: "id", header: "ID", width: "80px", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.id as string).slice(0, 8)}...</code> },
  { key: "section_id", header: "Section", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.section_id || "").slice(0, 8)}...</code> },
  { key: "label", header: "Label" },
  { key: "href", header: "URL", render: (r: any) => <span className="text-muted-foreground font-mono text-xs">{r.href}</span> },
  { key: "is_active", header: "Status", width: "100px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${r.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"}`}>{r.is_active ? "Active" : "Inactive"}</span>
  )},
  { key: "sort_order", header: "Order", width: "80px" },
]

export default function ContentFooterPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground tracking-tight">Footer Content</h1>
      <Tabs defaultValue="sections">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sections">Footer Sections</TabsTrigger>
          <TabsTrigger value="links">Footer Links</TabsTrigger>
        </TabsList>
        <TabsContent value="sections">
          <div className="mt-4">
            <CrudPage table="footer_sections" title="Footer Sections" columns={sectionColumns} searchable={["title"]} orderBy="sort_order" />
          </div>
        </TabsContent>
        <TabsContent value="links">
          <div className="mt-4">
            <CrudPage table="footer_links" title="Footer Links" columns={linkColumns} searchable={["label", "href"]} orderBy="sort_order" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
