import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { Loader2, Save } from "lucide-react"

interface ConfigItem { id: string; key: string; value: string; type: string; category: string; label: string; description: string; is_secret: boolean }

export default function EmailSettingsPage() {
  const [config, setConfig] = useState<ConfigItem[]>([])
  const [loading, setLoading] = useState(true)
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchConfig() }, [])
  async function fetchConfig() {
    setLoading(true)
    const { data, error } = await supabase.from("config").select("*").eq("category", "email").order("key")
    if (!error && data) setConfig(data)
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    await Promise.all(Object.entries(edits).map(([k, v]) => supabase.from("config").update({ value: v }).eq("key", k)))
    setEdits({}); fetchConfig()
    setSaving(false)
  }

  const getV = (k: string) => edits[k] ?? config.find(c => c.key === k)?.value ?? ""

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-foreground">Email Settings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{config.length} settings</p>
        </div>
        {Object.keys(edits).length > 0 && (
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 h-8 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            <Save className="h-3 w-3" /> {saving ? "Saving..." : "Save"}
          </button>
        )}
      </div>

      <div className="rounded-xl border border-border/50 bg-card divide-y divide-border/20">
        {config.map(item => (
          <div key={item.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/10 transition-colors">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground">{item.label || item.key}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{item.description || item.key}</p>
            </div>
            <input type={item.type === "email" ? "email" : "text"} value={getV(item.key)} onChange={e => setEdits({ ...edits, [item.key]: e.target.value })}
              className="w-72 rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 text-xs text-foreground focus:border-primary/50 focus:outline-none transition-colors" />
          </div>
        ))}
      </div>
    </div>
  )
}
