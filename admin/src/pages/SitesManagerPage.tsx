import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { Loader2, Plus, Globe, Users, FileText, ExternalLink, ToggleLeft, ToggleRight, Search } from "lucide-react"

interface Site { id: string; name: string; slug: string; domain: string; is_active: boolean; created_at: string; updated_at: string; total_users?: number; total_posts?: number }

export default function SitesManagerPage() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [newSite, setNewSite] = useState({ name: "", slug: "", domain: "" })
  const [adding, setAdding] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => { fetchSites() }, [])

  async function fetchSites() {
    setLoading(true)
    const { data, error } = await supabase.from("sites").select("*").order("name")
    if (!error && data) {
      const { data: statsData } = await supabase.rpc("get_sites_with_stats")
      const map: Record<string, any> = {}
      if (statsData) statsData.forEach((s: any) => { map[s.site_id] = s })
      setSites(data.map(s => ({ ...s, total_users: map[s.id]?.total_users ?? 0, total_posts: map[s.id]?.total_posts ?? 0 })))
    }
    setLoading(false)
  }

  async function handleAdd() {
    if (!newSite.name.trim() || !newSite.slug.trim()) return
    setAdding(true)
    await supabase.from("sites").insert({ name: newSite.name.trim(), slug: newSite.slug.trim(), domain: newSite.domain.trim() || null })
    setShowAdd(false); setNewSite({ name: "", slug: "", domain: "" }); fetchSites()
    setAdding(false)
  }

  async function handleToggle(id: string, current: boolean) {
    setToggling(id)
    await supabase.from("sites").update({ is_active: !current, updated_at: new Date().toISOString() }).eq("id", id)
    setToggling(null); fetchSites()
  }

  const filtered = sites.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.slug.includes(search))
  const total = sites.length
  const active = sites.filter(s => s.is_active).length

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-foreground">Sites</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{active} of {total} active</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1 h-8 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-3 w-3" /> Add
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <input type="text" placeholder="Search by name or slug..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full h-8 pl-8 pr-3 rounded-lg border border-border/60 bg-card text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none transition-colors" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(site => (
          <div key={site.id} className="bg-card border border-border/50 rounded-xl p-4 hover:border-border/70 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"><Globe className="h-4 w-4 text-primary" /></div>
                <div>
                  <h3 className="text-xs font-semibold text-foreground">{site.name}</h3>
                  <p className="text-[10px] text-muted-foreground">{site.slug}</p>
                </div>
              </div>
              <button onClick={() => handleToggle(site.id, site.is_active)} disabled={toggling === site.id}
                className={`p-1 rounded-lg transition-colors ${site.is_active ? "text-emerald-400 hover:bg-emerald-500/10" : "text-muted-foreground hover:bg-muted/30"}`}>
                {toggling === site.id ? <Loader2 className="h-4 w-4 animate-spin" /> : site.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
              </button>
            </div>
            {site.domain && <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1"><Globe className="h-2.5 w-2.5" />{site.domain}</p>}
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/20 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="h-3 w-3" />{site.total_users} users</span>
              <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{site.total_posts} posts</span>
              {site.domain && <a href={`https://${site.domain}`} target="_blank" rel="noopener" className="ml-auto p-0.5 rounded text-muted-foreground hover:text-foreground"><ExternalLink className="h-3 w-3" /></a>}
            </div>
            <div className="mt-2">
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${site.is_active ? "text-emerald-400 bg-emerald-500/10" : "text-muted-foreground bg-muted/30"}`}>{site.is_active ? "Active" : "Inactive"}</span>
            </div>
          </div>
        ))}
        {!filtered.length && <div className="col-span-full text-center py-10 text-xs text-muted-foreground">No sites found</div>}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-xl border border-border/60 bg-card p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-foreground mb-4">Add Site</h3>
            <div className="space-y-3">
              <div><label className="block text-xs text-muted-foreground mb-1">Name *</label>
                <input type="text" value={newSite.name} onChange={e => setNewSite({ ...newSite, name: e.target.value })} placeholder="My Site"
                  className="w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none" /></div>
              <div><label className="block text-xs text-muted-foreground mb-1">Slug *</label>
                <input type="text" value={newSite.slug} onChange={e => setNewSite({ ...newSite, slug: e.target.value })} placeholder="my-site"
                  className="w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none" /></div>
              <div><label className="block text-xs text-muted-foreground mb-1">Domain</label>
                <input type="text" value={newSite.domain} onChange={e => setNewSite({ ...newSite, domain: e.target.value })} placeholder="example.com"
                  className="w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none" /></div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => { setShowAdd(false); setNewSite({ name: "", slug: "", domain: "" }) }} className="rounded-lg border border-border/60 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={handleAdd} disabled={!newSite.name.trim() || !newSite.slug.trim() || adding}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {adding ? <Loader2 className="h-3 w-3 animate-spin" /> : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
