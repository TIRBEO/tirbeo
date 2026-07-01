import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { Loader2, TrendingUp, Users, Eye } from "lucide-react"

interface DailyData { date: string; count: number }
interface TopPage { path: string; views: number }

export default function AnalyticsPage() {
  const [visitors, setVisitors] = useState<DailyData[]>([])
  const [pageViews, setPageViews] = useState<DailyData[]>([])
  const [topPages, setTopPages] = useState<TopPage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const [dv, dp, tp] = await Promise.all([
        supabase.rpc("get_daily_visitors", { days: 30 }),
        supabase.rpc("get_daily_page_views", { days: 30 }),
        supabase.rpc("get_top_pages", { days: 7, max_count: 10 }),
      ])
      if (dv.data) setVisitors(dv.data)
      if (dp.data) setPageViews(dp.data)
      if (tp.data) setTopPages(tp.data)
      setLoading(false)
    })()
  }, [])

  const maxV = Math.max(...visitors.map(d => d.count), 1)
  const maxP = Math.max(...pageViews.map(d => d.count), 1)
  const totalV = visitors.reduce((a, d) => a + d.count, 0)
  const totalP = pageViews.reduce((a, d) => a + d.count, 0)

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>

  return (
    <div className="max-w-6xl space-y-5">
      <h1 className="text-sm font-semibold text-foreground">Analytics</h1>

      <div className="grid grid-cols-3 gap-3">
        {[{ l: "Visitors", v: totalV, i: Users, c: "text-blue-400" }, { l: "Page Views", v: totalP, i: Eye, c: "text-emerald-400" }, { l: "Avg Daily", v: visitors.length ? Math.round(totalV / visitors.length) : 0, i: TrendingUp, c: "text-amber-400" }].map(s => {
          const I = s.i
          return (
            <div key={s.l} className="bg-card border border-border/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{s.l}</p>
                <I className={`h-4 w-4 ${s.c}`} />
              </div>
              <p className="text-2xl font-semibold text-foreground tabular-nums">{s.v.toLocaleString()}</p>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border/50 rounded-xl p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Daily Visitors</p>
          <div className="flex items-end gap-0.5 h-36">
            {visitors.map((d, i) => (
              <div key={i} className="flex-1 relative group">
                <div className="w-full rounded-sm bg-blue-500/50 hover:bg-blue-500 transition-all cursor-pointer" style={{ height: `${(d.count / maxV) * 100}%`, minHeight: d.count > 0 ? 2 : 0 }} />
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                  <div className="bg-foreground text-background text-[10px] px-2 py-1 rounded font-medium whitespace-nowrap shadow-lg">{d.count} on {d.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Daily Page Views</p>
          <div className="flex items-end gap-0.5 h-36">
            {pageViews.map((d, i) => (
              <div key={i} className="flex-1 relative group">
                <div className="w-full rounded-sm bg-emerald-500/50 hover:bg-emerald-500 transition-all cursor-pointer" style={{ height: `${(d.count / maxP) * 100}%`, minHeight: d.count > 0 ? 2 : 0 }} />
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                  <div className="bg-foreground text-background text-[10px] px-2 py-1 rounded font-medium whitespace-nowrap shadow-lg">{d.count} on {d.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-xl p-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Top Pages (7d)</p>
        {topPages.length > 0 ? topPages.map((p, i) => {
          const m = Math.max(...topPages.map(x => Number(x.views)), 1)
          return (
            <div key={i} className="flex items-center gap-3 mb-2.5 last:mb-0">
              <span className="text-[10px] text-muted-foreground/40 w-4 text-right tabular-nums">{i + 1}</span>
              <span className="text-xs text-foreground font-mono truncate w-48">{p.path}</span>
              <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                <div className="h-full bg-primary/50 rounded-full" style={{ width: `${(Number(p.views) / m) * 100}%` }} />
              </div>
              <span className="text-xs text-muted-foreground tabular-nums w-12 text-right">{p.views.toLocaleString()}</span>
            </div>
          )
        }) : <p className="text-xs text-muted-foreground text-center py-6">No data</p>}
      </div>
    </div>
  )
}
