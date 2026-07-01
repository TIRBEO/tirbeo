import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"
import { Loader2, Save, Search } from "lucide-react"

interface ConfigItem { id: string; key: string; value: string; type: string; category: string; label: string; description: string; is_secret: boolean }
interface ExportItem { id: string; data_type: string; format: string; status: string; file_url: string | null; created_at: string }

const statusColors: Record<string, string> = {
  completed: "bg-emerald-500/10 text-emerald-400", pending: "bg-amber-500/10 text-amber-400",
  processing: "bg-blue-500/10 text-blue-400", failed: "bg-red-500/10 text-red-400",
}

export default function AccountsPage() {
  const [config, setConfig] = useState<ConfigItem[]>([])
  const [exports, setExports] = useState<ExportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const [cr, er] = await Promise.all([
      supabase.from("config").select("*").order("category").order("key"),
      supabase.from("exports").select("*").order("created_at", { ascending: false }),
    ])
    if (!cr.error && cr.data) setConfig(cr.data)
    if (!er.error && er.data) setExports(er.data)
    setLoading(false)
  }

  async function handleSave(id: string) {
    setSaving(true)
    await supabase.from("config").update({ value: editValue }).eq("id", id)
    setEditingId(null); fetchData()
    setSaving(false)
  }

  const filtered = config.filter(c => !search || c.key.toLowerCase().includes(search.toLowerCase()) || c.label.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>

  return (
    <div className="max-w-6xl space-y-5">
      <h1 className="text-sm font-semibold text-foreground">Accounts</h1>
      <Tabs defaultValue="config">
        <TabsList className="inline-flex rounded-lg bg-muted/30 p-1 gap-0">
          <TabsTrigger value="config">Config</TabsTrigger>
          <TabsTrigger value="exports">Exports</TabsTrigger>
        </TabsList>
        <TabsContent value="config">
          <div className="mt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 rounded-lg border border-border/60 bg-card text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none transition-colors" />
            </div>
            <div className="rounded-xl border border-border/50 bg-card divide-y divide-border/20">
              {filtered.map(item => (
                <div key={item.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/10 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{item.label || item.key}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.description}</p>
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
                        {item.is_secret ? "••••" : item.value.length > 35 ? item.value.slice(0, 35) + "..." : item.value}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="exports">
          <div className="mt-4 rounded-xl border border-border/50 bg-card overflow-hidden">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-border/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Format</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">File</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
              </tr></thead>
              <tbody>
                {exports.map(exp => (
                  <tr key={exp.id} className="border-b border-border/15 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-foreground">{exp.data_type}</td>
                    <td className="px-4 py-3 text-muted-foreground">{exp.format}</td>
                    <td className="px-4 py-3"><span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ${statusColors[exp.status] || ""}`}>{exp.status}</span></td>
                    <td className="px-4 py-3">{exp.file_url ? <a href={exp.file_url} target="_blank" rel="noopener" className="text-primary hover:underline text-xs">Download</a> : <span className="text-muted-foreground">-</span>}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(exp.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {!exports.length && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground text-xs">No exports</td></tr>}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
