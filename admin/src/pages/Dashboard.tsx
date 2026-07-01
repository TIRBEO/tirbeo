import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { Loader2, Users, FileText, ShieldCheck, Zap, MessageSquare, Key, Settings, ChevronRight, Globe, Database, HelpCircle, Calculator, RefreshCw, Star } from "lucide-react"

interface Stats {
  adminUsers: number; blogPosts: number; channels: number; integrations: number
  apiKeys: number; configItems: number; totalUsers: number; sites: number
  features: number; pricingPlans: number; faqs: number; teamMembers: number
  testimonials: number; subscribers: number; announcements: number
}

interface AuditLog { id: string; action: string; entity_type: string; created_at: string }
interface DailyData { date: string; count: number }
interface TopPage { path: string; views: number }

function getSession() { try { return JSON.parse(sessionStorage.getItem("admin_session") || "") } catch { return null } }

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 1) return "now"
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

const actionMeta: Record<string, { icon: typeof Star; color: string }> = {
  create: { icon: Star, color: "text-emerald-400" },
  update: { icon: Settings, color: "text-blue-400" },
  delete: { icon: Star, color: "text-red-400" },
}

export default function Dashboard() {
  const navigate = useNavigate()
  const session = getSession()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({ adminUsers: 0, blogPosts: 0, channels: 0, integrations: 0, apiKeys: 0, configItems: 0, totalUsers: 0, sites: 0, features: 0, pricingPlans: 0, faqs: 0, teamMembers: 0, testimonials: 0, subscribers: 0, announcements: 0 })
  const [visitors, setVisitors] = useState<DailyData[]>([])
  const [pages, setPages] = useState<TopPage[]>([])
  const [activity, setActivity] = useState<AuditLog[]>([])

  useEffect(() => {
    ;(async () => {
      const tables = [
        { k: "adminUsers" as const, t: "admin_users" }, { k: "blogPosts" as const, t: "blog_posts" },
        { k: "channels" as const, t: "channels" }, { k: "integrations" as const, t: "integrations" },
        { k: "apiKeys" as const, t: "api_keys" }, { k: "configItems" as const, t: "config" },
        { k: "totalUsers" as const, t: "user_profiles" }, { k: "sites" as const, t: "sites" },
        { k: "features" as const, t: "features" }, { k: "pricingPlans" as const, t: "pricing_plans" },
        { k: "faqs" as const, t: "faqs" }, { k: "teamMembers" as const, t: "team_members" },
        { k: "testimonials" as const, t: "testimonials" }, { k: "subscribers" as const, t: "newsletter_subscribers" },
        { k: "announcements" as const, t: "announcements" },
      ]
      const counts = await Promise.all(tables.map(q => supabase.from(q.t).select("id", { count: "exact", head: true }).then(r => ({ k: q.k, c: r.count || 0 }))))
      const [dv, tp, al] = await Promise.all([
        supabase.rpc("get_daily_visitors", { days: 30 }),
        supabase.rpc("get_top_pages", { days: 7, max_count: 5 }),
        supabase.from("admin_audit_log").select("*").order("created_at", { ascending: false }).limit(5),
      ])
      const s = { ...stats }
      counts.forEach(({ k, c }) => { (s as any)[k] = c })
      setStats(s)
      if (dv.data) setVisitors(dv.data)
      if (tp.data) setPages(tp.data)
      if (al.data) setActivity(al.data)
      setLoading(false)
    })()
  }, [])

  const maxV = Math.max(...visitors.map(d => d.count), 1)
  const primaryCards = [
    { l: "Users", v: stats.totalUsers, i: Users, c: "text-sky-400" },
    { l: "Blog Posts", v: stats.blogPosts, i: FileText, c: "text-emerald-400" },
    { l: "Admins", v: stats.adminUsers, i: ShieldCheck, c: "text-amber-400" },
    { l: "Features", v: stats.features, i: Zap, c: "text-violet-400" },
  ]
  const secondaryCards = [
    { l: "Channels", v: stats.channels, i: MessageSquare, h: "/chat" },
    { l: "Integrations", v: stats.integrations, i: Zap, h: "/integrations" },
    { l: "API Keys", v: stats.apiKeys, i: Key, h: "/api-keys" },
    { l: "Sites", v: stats.sites, i: Globe, h: "/sites" },
  ]

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-foreground">
            {session?.email ? <span>Good {new Date().getHours() < 12 ? "morning" : "evening"}<span className="max-sm:hidden">, {session.email.split("@")[0]}</span></span> : "Dashboard"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{stats.sites} sites · {Object.entries(stats).filter(([k]) => !["adminUsers", "blogPosts", "channels", "integrations", "apiKeys", "configItems", "totalUsers", "sites"].includes(k)).reduce((a, [,]) => a + 1, 0)} content items</p>
        </div>
        <button onClick={() => window.location.reload()} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"><RefreshCw className="h-3 w-3" />Refresh</button>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {primaryCards.map(c => {
          const I = c.i
          return (
            <div key={c.l} className="bg-card border border-border/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{c.l}</p>
                <I className={`h-4 w-4 ${c.c}`} />
              </div>
              <p className="text-2xl font-semibold text-foreground tabular-nums">{c.v.toLocaleString()}</p>
            </div>
          )
        })}
      </div>

      {/* Content overview + Secondary stats */}
      <div className="grid lg:grid-cols-4 gap-3">
        <div className="lg:col-span-2 bg-card border border-border/50 rounded-xl p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Content</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { l: "Pricing", v: stats.pricingPlans, h: "/content/pricing" },
              { l: "FAQ", v: stats.faqs, h: "/content/faq" },
              { l: "Team", v: stats.teamMembers, h: "/content/team" },
              { l: "Testimonials", v: stats.testimonials, h: "/content/testimonials" },
              { l: "Newsletter", v: stats.subscribers, h: "/content/newsletter" },
              { l: "Timeline", v: stats.pricingPlans, h: "/content/timeline" },
              { l: "Config", v: stats.configItems, h: "/config" },
              { l: "Plans", v: stats.pricingPlans, h: "/content/pricing" },
            ].map(item => (
              <button key={item.l} onClick={() => navigate(item.h)} className="text-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <p className="text-lg font-semibold text-foreground tabular-nums">{item.v.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground truncate">{item.l}</p>
              </button>
            ))}
          </div>
        </div>
        {secondaryCards.map(c => {
          const I = c.i
          return (
            <button key={c.l} onClick={() => navigate(c.h)} className="bg-card border border-border/50 rounded-xl p-4 text-left hover:border-border transition-colors group">
              <p className="text-xs text-muted-foreground">{c.l}</p>
              <p className="text-lg font-semibold text-foreground tabular-nums mt-0.5">{c.v.toLocaleString()}</p>
              <I className="h-3 w-3 text-muted-foreground/40 mt-2 group-hover:text-primary transition-colors" />
            </button>
          )
        })}
      </div>

      {/* Chart + Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Visitors (30d)</p>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" /> visitors
            </div>
          </div>
          {visitors.length > 0 ? (
            <div className="flex items-end gap-0.5 h-32">
              {visitors.map((d, i) => (
                <div key={i} className="flex-1 relative group">
                  <div className="w-full rounded-sm bg-primary/50 hover:bg-primary transition-all cursor-pointer" style={{ height: `${(d.count / maxV) * 100}%`, minHeight: d.count > 0 ? 2 : 0 }} />
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                    <div className="bg-foreground text-background text-[10px] px-2 py-1 rounded font-medium whitespace-nowrap shadow-lg">{d.count} on {d.date}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="h-32 flex items-center justify-center text-xs text-muted-foreground">No data</div>}
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Activity</p>
            <button onClick={() => navigate("/security")} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5">All <ChevronRight className="h-2.5 w-2.5" /></button>
          </div>
          <div className="space-y-1">
            {activity.map(a => {
              const m = actionMeta[a.action] || { icon: Star, color: "text-muted-foreground" }
              const I = m.icon
              return (
                <div key={a.id} className="flex items-center gap-2.5 py-1.5 text-xs">
                  <I className={`h-3 w-3 ${m.color} shrink-0`} />
                  <span className="text-foreground capitalize">{a.action}</span>
                  <span className="text-muted-foreground/60">{a.entity_type}</span>
                  <span className="ml-auto text-muted-foreground/40">{timeAgo(a.created_at)}</span>
                </div>
              )
            })}
            {!activity.length && <p className="text-xs text-muted-foreground py-6 text-center">No recent activity</p>}
          </div>
        </div>
      </div>

      {/* Top Pages + Quick Links */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border/50 rounded-xl p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Top Pages (7d)</p>
          {pages.length > 0 ? pages.map((p, i) => {
            const m = Math.max(...pages.map(x => Number(x.views)), 1)
            return (
              <div key={i} className="flex items-center gap-3 mb-3 last:mb-0">
                <span className="text-[10px] text-muted-foreground/40 w-3 text-right tabular-nums">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs text-foreground font-mono truncate">{p.path}</span>
                    <span className="text-[10px] text-muted-foreground ml-2 tabular-nums">{Number(p.views).toLocaleString()}</span>
                  </div>
                  <div className="h-1 bg-muted/40 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/50 rounded-full" style={{ width: `${(Number(p.views) / m) * 100}%` }} />
                  </div>
                </div>
              </div>
            )
          }) : <p className="text-xs text-muted-foreground text-center py-6">No page views yet</p>}
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Quick Actions</p>
          <div className="space-y-0.5">
            {[
              { l: "Sites", i: Globe, h: "/sites" },
              { l: "Admins", i: ShieldCheck, h: "/admin" },
              { l: "Features", i: Zap, h: "/content/features" },
              { l: "Pricing", i: Calculator, h: "/content/pricing" },
              { l: "FAQ", i: HelpCircle, h: "/content/faq" },
              { l: "Config", i: Database, h: "/config" },
            ].map(a => {
              const I = a.i
              return (
                <button key={a.l} onClick={() => navigate(a.h)} className="flex w-full items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                  <I className="h-3.5 w-3.5" />
                  {a.l}
                  <ChevronRight className="h-3 w-3 ml-auto text-muted-foreground/30" />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
