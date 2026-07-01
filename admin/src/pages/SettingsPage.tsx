import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { Loader2, Save, Search } from "lucide-react"

interface ConfigItem { id: string; key: string; value: string; type: string; category: string; label: string; description: string; is_secret: boolean; updated_at: string }

const cats = ["all", "general", "brand", "seo", "social", "urls", "email", "chat", "storage", "display", "feature", "integrations"]

export default function SettingsPage() {
  const [config, setConfig] = useState<ConfigItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [cat, setCat] = useState("all")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [saving, setSaving] = useState(false)

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

  const filtered = config.filter(c => {
    if (cat !== "all" && c.category !== cat) return false
    if (search && !c.key.toLowerCase().includes(search.toLowerCase()) && !c.label.toLowerCase().includes(search.toLowerCase()) && !c.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })
  const grouped = filtered.reduce<Record<string, ConfigItem[]>>((a, i) => { (a[i.category] = a[i.category] || []).push(i); return a }, {})

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>

  return (
    <div className="max-w-6xl space-y-5">
      <div>
        <h1 className="text-sm font-semibold text-foreground">Site Configuration</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{config.length} settings</p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-3 rounded-lg border border-border/60 bg-card text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none transition-colors" />
        </div>
        <select value={cat} onChange={e => setCat(e.target.value)} className="h-8 rounded-lg border border-border/60 bg-card px-2.5 text-xs text-foreground focus:outline-none">
          {cats.map(c => <option key={c} value={c}>{c === "all" ? "All" : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
      </div>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">{category}</p>
          <div className="rounded-xl border border-border/50 bg-card divide-y divide-border/20">
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
                      <input type="text" value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSave(item.id)}
                        className="flex-1 rounded-lg border border-primary/50 bg-muted/30 px-2.5 py-1 text-xs text-foreground focus:outline-none" autoFocus />
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
          </div>
        </div>
      ))}
      {!Object.keys(grouped).length && <p className="text-center py-10 text-xs text-muted-foreground">No settings found</p>}
    </div>
  )
}
