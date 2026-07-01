import { CrudPage } from "../lib/crud"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"

const channelsColumns = [
  { key: "id", header: "ID", width: "80px", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.id as string).slice(0, 8)}...</code> },
  { key: "name", header: "Name" },
  { key: "type", header: "Type", width: "120px", render: (r: any) => (
    <span className="inline-flex rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400">{r.type}</span>
  )},
  { key: "topic", header: "Topic" },
  { key: "is_private", header: "Private", width: "100px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${r.is_private ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"}`}>
      {r.is_private ? "Private" : "Public"}
    </span>
  )},
  { key: "created_at", header: "Created", width: "180px", render: (r: any) => new Date(r.created_at).toLocaleDateString() }
]

const blogColumns = [
  { key: "id", header: "ID", width: "80px", render: (r: any) => <code className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">{(r.id as string).slice(0, 8)}...</code> },
  { key: "title", header: "Title" },
  { key: "slug", header: "Slug" },
  { key: "author_name", header: "Author", width: "140px" },
  { key: "is_published", header: "Status", width: "100px", render: (r: any) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${r.is_published ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
      {r.is_published ? "Published" : "Draft"}
    </span>
  )},
  { key: "created_at", header: "Created", width: "180px", render: (r: any) => new Date(r.created_at).toLocaleDateString() }
]

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground tracking-tight">Chat</h1>
      <Tabs defaultValue="channels">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="blog">Blog Posts</TabsTrigger>
        </TabsList>
        <TabsContent value="channels">
          <div className="mt-4">
            <CrudPage table="channels" title="Chat Channels" columns={channelsColumns} searchable={["name", "topic"]} orderBy="created_at" />
          </div>
        </TabsContent>
        <TabsContent value="blog">
          <div className="mt-4">
            <CrudPage table="blog_posts" title="Blog Posts" columns={blogColumns} searchable={["title", "slug", "author_name"]} orderBy="created_at" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
