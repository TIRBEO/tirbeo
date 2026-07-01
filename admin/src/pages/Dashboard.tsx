import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { Loader2, Users, FileText, ShieldCheck, Zap, MessageSquare, Key, Settings, ChevronRight, Globe, Database, HelpCircle, Calculator, RefreshCw, Star, TrendingUp, Eye, Activity, Hash, BarChart3, Mail, LayoutDashboard, Sparkles } from "lucide-react"

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

const actionMeta: Record<string, { icon: typeof Star; color: string; bg: string }> = {
  create: { icon: Star, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  update: { icon: Settings, color: "text-blue-400", bg: "bg-blue-500/10" },
  delete: { icon: Star, color: "text-red-400", bg: "bg-red-500/10" },
}

function StatCardMini({ label, value, icon: Icon, color, onClick }: { label: string; value: number; icon: any; color: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} disabled={!onClick}
      className="relative overflow-hidden rounded-xl border border-border/40 bg-card p-4 text-left transition-all duration-200 hover:border-primary/20 hover:shadow-[0_0_0_1px_rgba(107,92,247,0.1)] group">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">{label}</p>
        <div className={`h-7 w-7 rounded-lg ${color}/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
          <Icon className={`h-3.5 w-3.5 ${color}`} />
        </div>
      </div>
      <p className="text-xl font-bold text-foreground tabular-nums">{value.toLocaleString()}</p>
    </button>
  )
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

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        </div>
        <p className="text-xs text-muted-foreground/60">Loading dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="h-5 w-5 rounded-md bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <LayoutDashboard className="h-3 w-3 text-primary-foreground" />
            </span>
            {session?.email ? (
              <span>Good {new Date().getHours() < 12 ? "morning" : "evening"}<span className="max-sm:hidden">, {session.email.split("@")[0]}</span></span>
            ) : "Dashboard"}
          </h1>
          <p className="text-xs text-muted-foreground/60 mt-0.5 flex items-center gap-1.5">
            <span>{stats.sites} site{stats.sites !== 1 ? "s" : ""}</span>
            <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/30" />
            <span>{visitors.length > 0 && `${visitors.reduce((a, d) => a + d.count, 0).toLocaleString()} visitors (30d)`}</span>
          </p>
        </div>
        <button onClick={() => window.location.reload()}
          className="text-xs text-muted-foreground/50 hover:text-foreground transition-colors flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-muted/30">
          <RefreshCw className="h-3 w-3" /> Refresh
        </button>
      </div>

      {/* Primary Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-slide-up">
        <StatCardMini label="Total Users" value={stats.totalUsers} icon={Users} color="text-sky-400" onClick={() => navigate("/users")} />
        <StatCardMini label="Blog Posts" value={stats.blogPosts} icon={FileText} color="text-emerald-400" onClick={() => navigate("/content/blog")} />
        <StatCardMini label="Admin Users" value={stats.adminUsers} icon={ShieldCheck} color="text-amber-400" onClick={() => navigate("/admin")} />
        <StatCardMini label="Features" value={stats.features} icon={Zap} color="text-violet-400" onClick={() => navigate("/content/features")} />
      </div>

      {/* Content + Secondary Stats */}
      <div className="grid lg:grid-cols-4 gap-3 animate-slide-up">
        <div className="lg:col-span-2 rounded-xl border border-border/40 bg-card p-5 card-hover">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider flex items-center gap-1.5">
              <Hash className="h-3 w-3" /> Content Overview
            </p>
            <span className="text-[10px] text-muted-foreground/40">{Object.values(stats).reduce((a, b) => a + b, 0).toLocaleString()} total items</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { l: "Pricing", v: stats.pricingPlans, h: "/content/pricing", c: "text-blue-400" },
              { l: "FAQ", v: stats.faqs, h: "/content/faq", c: "text-emerald-400" },
              { l: "Team", v: stats.teamMembers, h: "/content/team", c: "text-amber-400" },
              { l: "Testimonials", v: stats.testimonials, h: "/content/testimonials", c: "text-violet-400" },
              { l: "Newsletter", v: stats.subscribers, h: "/content/newsletter", c: "text-pink-400" },
              { l: "Sites", v: stats.sites, h: "/sites", c: "text-sky-400" },
              { l: "Config", v: stats.configItems, h: "/config", c: "text-orange-400" },
              { l: "API Keys", v: stats.apiKeys, h: "/api-keys", c: "text-rose-400" },
            ].map(item => (
              <button key={item.l} onClick={() => navigate(item.h)}
                className="text-center p-2 rounded-lg hover:bg-muted/40 transition-all group">
                <p className="text-lg font-bold text-foreground tabular-nums group-hover:scale-110 transition-transform">{item.v.toLocaleString()}</p>
                <p className="text-[9px] text-muted-foreground/50 truncate mt-0.5">{item.l}</p>
              </button>
            ))}
          </div>
        </div>
        {[
          { l: "Channels", v: stats.channels, i: MessageSquare, h: "/chat", c: "text-blue-400" },
          { l: "Integrations", v: stats.integrations, i: Zap, h: "/integrations", c: "text-emerald-400" },
        ].map(card => {
          const I = card.i
          return (
            <button key={card.l} onClick={() => navigate(card.h)}
              className="rounded-xl border border-border/40 bg-card p-5 text-left transition-all duration-200 hover:border-primary/20 hover:shadow-[0_0_0_1px_rgba(107,92,247,0.1)] group">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">{card.l}</p>
                <I className={`h-4 w-4 ${card.c} opacity-60 group-hover:opacity-100 transition-opacity`} />
              </div>
              <p className="text-lg font-bold text-foreground tabular-nums">{card.v.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground/40 mt-1 flex items-center gap-0.5">View details <ChevronRight className="h-2.5 w-2.5" /></p>
            </button>
          )
        })}
      </div>

      {/* Chart + Activity */}
      <div className="grid lg:grid-cols-3 gap-4 animate-slide-up">
        <div className="lg:col-span-2 rounded-xl border border-border/40 bg-card p-5 card-hover">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="h-3 w-3" /> Visitors (30 days)
            </p>
            {visitors.length > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                <span>{visitors.reduce((a, d) => a + d.count, 0).toLocaleString()} total</span>
              </div>
            )}
          </div>
          {visitors.length > 0 ? (
            <div className="flex items-end gap-0.5 h-36">
              {visitors.map((d, i) => (
                <div key={i} className="flex-1 relative group">
                  <div className="w-full rounded-sm bg-gradient-to-t from-primary/40 to-primary/20 hover:from-primary/60 hover:to-primary/30 transition-all duration-150 cursor-pointer"
                    style={{ height: `${(d.count / maxV) * 100}%`, minHeight: d.count > 0 ? 3 : 0 }} />
                  <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                    <div className="bg-foreground text-background text-[10px] px-2.5 py-1.5 rounded-lg font-semibold whitespace-nowrap shadow-2xl">
                      {d.count.toLocaleString()} on {new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-36 flex items-center justify-center">
              <div className="text-center">
                <Eye className="h-5 w-5 text-muted-foreground/20 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground/40">No visitor data yet</p>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border/40 bg-card p-5 card-hover">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="h-3 w-3" /> Activity
            </p>
            <button onClick={() => navigate("/security")}
              className="text-[10px] text-muted-foreground/50 hover:text-foreground transition-colors flex items-center gap-0.5">
              All <ChevronRight className="h-2.5 w-2.5" />
            </button>
          </div>
          <div className="space-y-1">
            {activity.map((a, i) => {
              const m = actionMeta[a.action] || { icon: Star, color: "text-muted-foreground", bg: "bg-muted/30" }
              const I = m.icon
              return (
                <div key={a.id} className="flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-muted/20 transition-colors group" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className={`h-6 w-6 rounded-lg ${m.bg} flex items-center justify-center shrink-0`}>
                    <I className={`h-3 w-3 ${m.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground capitalize font-medium">{a.action}</p>
                    <p className="text-[10px] text-muted-foreground/50 truncate">{a.entity_type}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground/40 shrink-0 tabular-nums">{timeAgo(a.created_at)}</span>
                </div>
              )
            })}
            {!activity.length && (
              <div className="text-center py-6">
                <Activity className="h-5 w-5 text-muted-foreground/20 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground/40">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Pages + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-4 animate-slide-up">
        <div className="lg:col-span-2 rounded-xl border border-border/40 bg-card p-5 card-hover">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3" /> Top Pages (7 days)
            </p>
          </div>
          {pages.length > 0 ? pages.map((p, i) => {
            const m = Math.max(...pages.map(x => Number(x.views)), 1)
            return (
              <div key={i} className="flex items-center gap-3 mb-3 last:mb-0 group">
                <span className="text-[10px] text-muted-foreground/30 w-4 text-right tabular-nums font-medium">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-foreground/80 font-mono truncate group-hover:text-foreground transition-colors">{p.path}</span>
                    <span className="text-[10px] text-muted-foreground/50 ml-2 tabular-nums font-medium">{Number(p.views).toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary/30 transition-all duration-300" style={{ width: `${(Number(p.views) / m) * 100}%`, minWidth: p.views > 0 ? "2%" : 0 }} />
                  </div>
                </div>
              </div>
            )
          }) : (
            <div className="text-center py-6">
              <BarChart3 className="h-5 w-5 text-muted-foreground/20 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground/40">No page views recorded yet</p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border/40 bg-card p-5 card-hover">
          <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> Quick Actions
          </p>
          <div className="space-y-0.5">
            {[
              { l: "Sites", i: Globe, h: "/sites", c: "text-sky-400" },
              { l: "Admins", i: ShieldCheck, h: "/admin", c: "text-amber-400" },
              { l: "Blog", i: FileText, h: "/content/blog", c: "text-emerald-400" },
              { l: "Pricing", i: Calculator, h: "/content/pricing", c: "text-blue-400" },
              { l: "FAQ", i: HelpCircle, h: "/content/faq", c: "text-violet-400" },
              { l: "Mail", i: Mail, h: "/content/newsletter", c: "text-pink-400" },
              { l: "Config", i: Database, h: "/config", c: "text-orange-400" },
              { l: "Analytics", i: BarChart3, h: "/analytics", c: "text-rose-400" },
            ].map(a => {
              const I = a.i
              return (
                <button key={a.l} onClick={() => navigate(a.h)}
                  className="flex w-full items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-muted-foreground/70 hover:text-foreground hover:bg-muted/30 transition-all group">
                  <I className={`h-3.5 w-3.5 ${a.c} opacity-60 group-hover:opacity-100`} />
                  {a.l}
                  <ChevronRight className="h-3 w-3 ml-auto text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors" />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
