import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"
import { CrudPage } from "../lib/crud"

const testimonialColumns = [
  { key: "id", header: "ID", width: "80px", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.id as string).slice(0, 8)}...</code> },
  { key: "author", header: "Author" },
  { key: "role", header: "Role", render: (r: any) => <span className="text-muted-foreground text-xs">{r.role || "-"}</span> },
  { key: "quote", header: "Quote", render: (r: any) => <span className="text-muted-foreground">{(r.quote || "").slice(0, 60)}</span> },
  { key: "rating", header: "Rating", width: "80px", render: (r: any) => r.rating ? <span className="text-amber-400">{Array(r.rating).fill("★").join("")}</span> : <span className="text-muted-foreground">-</span> },
  { key: "is_active", header: "Status", width: "100px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${r.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"}`}>{r.is_active ? "Active" : "Inactive"}</span>
  )},
]

const featureColumns = [
  { key: "id", header: "ID", width: "80px", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.id as string).slice(0, 8)}...</code> },
  { key: "icon", header: "Icon", width: "60px", render: (r: any) => <span className="text-lg">{r.icon || "⚡"}</span> },
  { key: "title", header: "Title" },
  { key: "description", header: "Description", render: (r: any) => <span className="text-muted-foreground">{(r.description || "").slice(0, 60)}</span> },
  { key: "is_active", header: "Status", width: "100px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${r.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"}`}>{r.is_active ? "Active" : "Inactive"}</span>
  )},
]

export default function ContentShowcasePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground tracking-tight">Showcase</h1>
      <Tabs defaultValue="testimonials">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>
        <TabsContent value="testimonials">
          <div className="mt-4">
            <CrudPage table="testimonials" title="Testimonials" columns={testimonialColumns} searchable={["author", "role", "quote"]} orderBy="sort_order" />
          </div>
        </TabsContent>
        <TabsContent value="features">
          <div className="mt-4">
            <CrudPage table="features" title="Features" columns={featureColumns} searchable={["title", "description"]} orderBy="sort_order" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
