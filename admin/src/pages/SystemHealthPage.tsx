import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { Loader2, Activity, Server, Database, Globe, CheckCircle, AlertTriangle, XCircle } from "lucide-react"

interface HealthCheck { id?: string; service: string; status: string; response_time_ms: number; checked_at: string }

const services = [
  { name: "Supabase API", url: "https://mvogfnbqpaiedkkslecn.supabase.co/rest/v1/", icon: Database },
  { name: "Auth Service", url: "https://mvogfnbqpaiedkkslecn.supabase.co/auth/v1/health", icon: Server },
  { name: "Realtime", url: "https://mvogfnbqpaiedkkslecn.supabase.co/realtime/v1/websocket", icon: Globe },
]

const statusIcon = (s: string) => s === "operational" ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : s === "degraded" ? <AlertTriangle className="h-4 w-4 text-amber-400" /> : <XCircle className="h-4 w-4 text-red-400" />
const statusColor = (s: string) => s === "operational" ? "bg-emerald-500/10 text-emerald-400" : s === "degraded" ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"

export default function SystemHealthPage() {
  const [health, setHealth] = useState<HealthCheck[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)

  useEffect(() => { fetchHealth() }, [])

  async function fetchHealth() {
    setLoading(true)
    const { data, error } = await supabase.from("system_health").select("*").order("checked_at", { ascending: false }).limit(50)
    if (!error && data) setHealth(data)
    setLoading(false)
  }

  async function runCheck() {
    setChecking(true)
    for (const svc of services) {
      const start = Date.now()
      let status = "operational"
      try {
        const res = await fetch(svc.url, { method: "GET", signal: AbortSignal.timeout(5000) })
        if (!res.ok) status = "degraded"
      } catch { status = "down" }
      await supabase.from("system_health").insert({ service: svc.name, status, response_time_ms: Date.now() - start })
    }
    await fetchHealth()
    setChecking(false)
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-foreground">System Health</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{health.length} checks recorded</p>
        </div>
        <button onClick={runCheck} disabled={checking} className="flex items-center gap-1 h-8 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          <Activity className={`h-3 w-3 ${checking ? "animate-spin" : ""}`} /> {checking ? "Running..." : "Check"}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {services.map(svc => {
          const latest = health.find(h => h.service === svc.name)
          const I = svc.icon
          return (
            <div key={svc.name} className="bg-card border border-border/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><I className="h-4.5 w-4.5 text-primary" /></div>
                <div>
                  <p className="text-xs font-medium text-foreground">{svc.name}</p>
                  {latest && <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium mt-0.5 ${statusColor(latest.status)}`}>{statusIcon(latest.status)}{latest.status}</span>}
                  {!latest && <span className="text-[10px] text-muted-foreground mt-0.5 block">No checks yet</span>}
                </div>
              </div>
              {latest && <p className="text-[10px] text-muted-foreground">{latest.response_time_ms}ms · {new Date(latest.checked_at).toLocaleString()}</p>}
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/40">
          <p className="text-xs font-medium text-foreground">History</p>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/20">
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Service</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Response</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Time</th>
            </tr>
          </thead>
          <tbody>
            {health.map(h => (
              <tr key={h.id} className="border-b border-border/15 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-2.5 text-foreground">{h.service}</td>
                <td className="px-4 py-2.5"><span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${statusColor(h.status)}`}>{statusIcon(h.status)} {h.status}</span></td>
                <td className="px-4 py-2.5 text-muted-foreground">{h.response_time_ms}ms</td>
                <td className="px-4 py-2.5 text-muted-foreground">{new Date(h.checked_at).toLocaleString()}</td>
              </tr>
            ))}
            {!health.length && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-xs">No checks</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
