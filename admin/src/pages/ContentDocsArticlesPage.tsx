import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"
import { CrudPage } from "../lib/crud"

const categoryColumns = [
  { key: "id", header: "ID", width: "80px", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.id as string).slice(0, 8)}...</code> },
  { key: "title", header: "Category" },
  { key: "slug", header: "Slug", render: (r: any) => <span className="text-muted-foreground font-mono text-xs">{r.slug}</span> },
  { key: "description", header: "Description", render: (r: any) => <span className="text-muted-foreground">{(r.description || "").slice(0, 60)}</span> },
  { key: "sort_order", header: "Order", width: "80px" },
]

const articleColumns = [
  { key: "id", header: "ID", width: "80px", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.id as string).slice(0, 8)}...</code> },
  { key: "title", header: "Title" },
  { key: "slug", header: "Slug", render: (r: any) => <span className="text-muted-foreground font-mono text-xs">{r.slug}</span> },
  { key: "category_id", header: "Category", render: (r: any) => <span className="text-muted-foreground">{(r.category_id || "").slice(0, 8)}...</span> },
  { key: "is_published", header: "Status", width: "100px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${r.is_published ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"}`}>{r.is_published ? "Published" : "Draft"}</span>
  )},
]

export default function ContentDocsArticlesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground tracking-tight">Documentation</h1>
      <Tabs defaultValue="categories">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="articles">Articles</TabsTrigger>
        </TabsList>
        <TabsContent value="categories">
          <div className="mt-4">
            <CrudPage table="doc_categories" title="Doc Categories" columns={categoryColumns} searchable={["title", "slug", "description"]} orderBy="sort_order" />
          </div>
        </TabsContent>
        <TabsContent value="articles">
          <div className="mt-4">
            <CrudPage table="doc_articles" title="Doc Articles" columns={articleColumns} searchable={["title", "slug", "content"]} orderBy="created_at desc" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
