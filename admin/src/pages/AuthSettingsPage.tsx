import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { Loader2, Save, Key, RefreshCw, Shield } from "lucide-react"

interface ConfigItem { id: string; key: string; value: string; type: string; category: string; label: string; description: string; is_secret: boolean; updated_at: string }

export default function AuthSettingsPage() {
  const [config, setConfig] = useState<ConfigItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [saving, setSaving] = useState(false)
  const [userCount, setUserCount] = useState<number | null>(null)

  useEffect(() => { fetchAuthConfig(); fetchUserCount() }, [])

  async function fetchAuthConfig() {
    setLoading(true)
    const { data, error } = await supabase.from("config").select("*").or("category.eq.general,and(key.ilike.auth_%),and(key.ilike.session_%),and(key.ilike.registration_%)").order("key")
    if (!error && data) setConfig(data)
    setLoading(false)
  }

  async function fetchUserCount() {
    const { count } = await supabase.from("user_profiles").select("*", { count: "exact", head: true })
    if (count !== null) setUserCount(count)
  }

  async function handleSave(id: string) {
    setSaving(true)
    await supabase.from("config").update({ value: editValue, updated_at: new Date().toISOString() }).eq("id", id)
    setEditingId(null)
    setSaving(false)
  }

  const renderItem = (item: ConfigItem) => (
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
  )

  const sections = [
    { key: "registration", label: "Registration", icon: Shield, color: "text-amber-400", items: config.filter(c => c.key.startsWith("registration_") || c.key === "registration_enabled") },
    { key: "session", label: "Session", icon: Key, color: "text-blue-400", items: config.filter(c => c.key.startsWith("session_")) },
    { key: "provider", label: "Auth Providers", icon: Key, color: "text-emerald-400", items: config.filter(c => c.key.startsWith("auth_") && !c.key.startsWith("session_") && !c.key.startsWith("registration_")) },
  ]

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-foreground">Auth Settings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{userCount ?? "—"} users</p>
        </div>
        <button onClick={fetchAuthConfig} className="flex items-center gap-1 h-8 rounded-lg border border-border/60 bg-card px-3 text-xs text-foreground hover:bg-muted transition-colors">
          <RefreshCw className="h-3 w-3" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[{ l: "Auth Users", v: userCount ?? "—", c: "text-primary" }, { l: "Config Items", v: config.length, c: "text-blue-400" }, { l: "Providers", v: sections[2].items.length, c: "text-emerald-400" }].map(s => (
          <div key={s.l} className="bg-card border border-border/50 rounded-xl p-3">
            <p className="text-xs text-muted-foreground">{s.l}</p>
            <p className={`text-lg font-semibold text-foreground tabular-nums mt-0.5 ${s.c}`}>{s.v}</p>
          </div>
        ))}
      </div>

      {sections.map(s => (
        <div key={s.key} className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <h2 className="text-xs font-semibold text-foreground">{s.label}</h2>
            </div>
          </div>
          <div className="divide-y divide-border/20">
            {s.items.length > 0 ? s.items.map(renderItem) : <p className="px-4 py-3 text-xs text-muted-foreground">No items</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
