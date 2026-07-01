import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { Loader2, Save, Search, RotateCcw, ChevronDown } from "lucide-react"

interface ConfigItem { id: string; key: string; value: string; type: string; category: string; label: string; description: string; is_secret: boolean; updated_at: string }

export default function UniversalConfigPage() {
  const [config, setConfig] = useState<ConfigItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [catFilter, setCatFilter] = useState("all")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => { fetchConfig() }, [])

  async function fetchConfig() {
    setLoading(true)
    const { data, error } = await supabase.from("config").select("*").order("category").order("key")
    if (!error && data) setConfig(data)
    setLoading(false)
  }

  async function handleSave(id: string) {
    setSaving(true)
    await supabase.from("config").update({ value: editValue, updated_at: new Date().toISOString() }).eq("id", id)
    setEditingId(null); fetchConfig()
    setSaving(false)
  }

  const cats = ["all", ...new Set(config.map(c => c.category))]
  const filtered = config.filter(c => {
    if (catFilter !== "all" && c.category !== catFilter) return false
    if (search && !c.key.toLowerCase().includes(search.toLowerCase()) && !c.label.toLowerCase().includes(search.toLowerCase()) && !c.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })
  const grouped = filtered.reduce<Record<string, ConfigItem[]>>((a, item) => { (a[item.category] = a[item.category] || []).push(item); return a }, {})

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-foreground">Universal Config</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{config.length} keys</p>
        </div>
        <button onClick={fetchConfig} className="flex items-center gap-1 h-8 rounded-lg border border-border/60 bg-card px-3 text-xs text-foreground hover:bg-muted transition-colors">
          <RotateCcw className="h-3 w-3" /> Refresh
        </button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-3 rounded-lg border border-border/60 bg-card text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none transition-colors" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="h-8 rounded-lg border border-border/60 bg-card px-2.5 text-xs text-foreground focus:border-primary/50 focus:outline-none">
          {cats.map(c => <option key={c} value={c}>{c === "all" ? "All" : c}</option>)}
        </select>
      </div>

      {Object.entries(grouped).map(([cat, items]) => {
        const open = expanded.has(cat)
        return (
          <div key={cat} className="rounded-xl border border-border/50 bg-card overflow-hidden">
            <button onClick={() => setExpanded(p => { const n = new Set(p); if (n.has(cat)) n.delete(cat); else n.add(cat); return n })}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/10 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{cat}</span>
                <span className="text-[10px] text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded">{items.length}</span>
              </div>
              <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && <div className="divide-y divide-border/20">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/10 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">{item.label || item.key}</span>
                      <span className="text-[10px] text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded">{item.type}</span>
                      {item.is_secret && <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">Secret</span>}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.description || item.key}</p>
                  </div>
                  <div className="w-64">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-1.5">
                        <input type={item.is_secret ? "password" : "text"} value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSave(item.id)}
                          className="flex-1 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1 text-xs text-foreground focus:border-primary/50 focus:outline-none" autoFocus />
                        <button onClick={() => handleSave(item.id)} disabled={saving} className="p-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"><Save className="h-3 w-3" /></button>
                        <button onClick={() => setEditingId(null)} className="p-1 rounded-lg text-muted-foreground hover:text-foreground">✕</button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingId(item.id); setEditValue(item.value) }} className="w-full text-left rounded-lg border border-border/40 bg-muted/20 px-2.5 py-1 text-xs text-foreground hover:border-border/70 transition-colors">
                        {item.is_secret ? "••••••" : item.value.length > 35 ? item.value.slice(0, 35) + "..." : item.value}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>}
          </div>
        )
      })}
      {!Object.keys(grouped).length && <p className="text-center py-10 text-xs text-muted-foreground">No matches</p>}
    </div>
  )
}
