import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { Loader2, Search } from "lucide-react"

interface AuditLog { id: string; admin_user_id: string; action: string; entity_type: string; entity_id: string | null; details: Record<string, unknown>; ip_address: string | null; created_at: string }

const actionColors: Record<string, string> = {
  create: "bg-emerald-500/10 text-emerald-400", update: "bg-blue-500/10 text-blue-400",
  delete: "bg-red-500/10 text-red-400", login: "bg-amber-500/10 text-amber-400",
  logout: "bg-muted text-muted-foreground",
}

export default function SecurityPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => { fetchLogs() }, [])

  async function fetchLogs() {
    setLoading(true)
    const { data, error } = await supabase.from("admin_audit_log").select("*").order("created_at", { ascending: false }).limit(200)
    if (!error && data) setLogs(data)
    setLoading(false)
  }

  const filtered = logs.filter(l => l.action.toLowerCase().includes(search.toLowerCase()) || l.entity_type.toLowerCase().includes(search.toLowerCase()) || (l.ip_address || "").includes(search))

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>

  return (
    <div className="max-w-6xl space-y-5">
      <div>
        <h1 className="text-sm font-semibold text-foreground">Audit Log</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{logs.length} entries</p>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <input type="text" placeholder="Search by action, entity, or IP..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full h-8 pl-8 pr-3 rounded-lg border border-border/60 bg-card text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none transition-colors" />
      </div>

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Entity</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">ID</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">IP</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Details</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Time</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(log => (
              <tr key={log.id} className="border-b border-border/15 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-medium ${actionColors[log.action] || "bg-muted text-muted-foreground"}`}>{log.action}</span>
                </td>
                <td className="px-4 py-3 text-foreground">{log.entity_type}</td>
                <td className="px-4 py-3">{log.entity_id ? <code className="text-[10px] text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded">{log.entity_id.slice(0, 8)}...</code> : <span className="text-muted-foreground">-</span>}</td>
                <td className="px-4 py-3 text-muted-foreground font-mono">{log.ip_address || "-"}</td>
                <td className="px-4 py-3"><pre className="text-[10px] text-muted-foreground bg-muted/20 rounded px-1.5 py-0.5 max-w-xs overflow-auto max-h-12">{JSON.stringify(log.details)}</pre></td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-xs">No entries</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
