import { NavLink } from "react-router-dom"
import { X, LayoutDashboard, Settings, Users, Shield, Globe, MessageSquare, FileText, Key, Link2, BarChart3, Sparkles, Activity, Mail, Database, Layers, CheckCircle, MessageCircle, Award, Box, Zap, Clock, Calculator, BookOpen, HelpCircle, Bell, Radio, HardDrive, LineChart, Navigation, PanelRight } from "lucide-react"

interface NavItem {
  name: string; href: string; icon: React.ComponentType<{ className?: string }>; roles: string[]; section: string
}

const sections = [
  { key: "overview", name: "Overview" },
  { key: "content", name: "Content" },
  { key: "communication", name: "Communication" },
  { key: "users", name: "Users" },
  { key: "settings", name: "Settings" },
  { key: "admin", name: "Admin" },
]

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["super_admin", "admin", "manager", "editor", "viewer"], section: "overview" },
  { name: "Analytics", href: "/analytics", icon: BarChart3, roles: ["super_admin", "admin", "manager"], section: "overview" },
  { name: "Sites", href: "/sites", icon: Globe, roles: ["super_admin", "admin"], section: "overview" },
  { name: "Landing Pages", href: "/landing", icon: FileText, roles: ["super_admin", "admin", "manager", "editor"], section: "content" },
  { name: "Content Manager", href: "/chat-landing", icon: MessageSquare, roles: ["super_admin", "admin", "manager", "editor"], section: "content" },
  { name: "Documentation", href: "/docs", icon: BookOpen, roles: ["super_admin", "admin", "manager", "editor"], section: "content" },
  { name: "Docs Articles", href: "/content/docs", icon: BookOpen, roles: ["super_admin", "admin", "editor"], section: "content" },
  { name: "Blog", href: "/content/blog", icon: FileText, roles: ["super_admin", "admin", "editor"], section: "content" },
  { name: "Features", href: "/content/features", icon: Zap, roles: ["super_admin", "admin", "editor"], section: "content" },
  { name: "Pricing", href: "/content/pricing", icon: Calculator, roles: ["super_admin", "admin", "editor"], section: "content" },
  { name: "FAQ", href: "/content/faq", icon: HelpCircle, roles: ["super_admin", "admin", "editor"], section: "content" },
  { name: "Team", href: "/content/team", icon: Users, roles: ["super_admin", "admin", "editor"], section: "content" },
  { name: "Testimonials", href: "/content/testimonials", icon: Award, roles: ["super_admin", "admin", "editor"], section: "content" },
  { name: "Timeline", href: "/content/timeline", icon: Clock, roles: ["super_admin", "admin", "editor"], section: "content" },
  { name: "Timeline Events", href: "/content/timeline-events", icon: Clock, roles: ["super_admin", "admin", "editor"], section: "content" },
  { name: "Sections", href: "/content/sections", icon: LayoutDashboard, roles: ["super_admin", "admin", "editor"], section: "content" },
  { name: "Showcase", href: "/content/showcase", icon: Award, roles: ["super_admin", "admin", "editor"], section: "content" },
  { name: "Logos", href: "/content/marquee-logos", icon: Award, roles: ["super_admin", "admin", "editor"], section: "content" },
  { name: "Landing Stats", href: "/content/landing-stats", icon: Activity, roles: ["super_admin", "admin", "editor"], section: "content" },
  { name: "Announcements", href: "/content/announcements", icon: MessageCircle, roles: ["super_admin", "admin", "editor"], section: "content" },
  { name: "Newsletter", href: "/content/newsletter", icon: Mail, roles: ["super_admin", "admin", "editor"], section: "content" },
  { name: "Newsletter Campaigns", href: "/content/newsletter-campaigns", icon: Mail, roles: ["super_admin", "admin", "editor"], section: "content" },
  { name: "Nav Links", href: "/content/nav-links", icon: Navigation, roles: ["super_admin", "admin", "editor"], section: "content" },
  { name: "Footer", href: "/content/footer", icon: FileText, roles: ["super_admin", "admin", "editor"], section: "content" },
  { name: "Apps", href: "/content/apps", icon: Box, roles: ["super_admin", "admin", "editor"], section: "content" },
  { name: "Chat", href: "/chat", icon: MessageSquare, roles: ["super_admin", "admin", "manager"], section: "communication" },
  { name: "Users", href: "/users", icon: Users, roles: ["super_admin", "admin", "manager"], section: "users" },
  { name: "Admin Users", href: "/admin", icon: Shield, roles: ["super_admin", "admin"], section: "users" },
  { name: "Permissions", href: "/permissions", icon: Shield, roles: ["super_admin"], section: "users" },
  { name: "Approvals", href: "/admin/content-approval", icon: CheckCircle, roles: ["super_admin", "admin", "manager"], section: "users" },
  { name: "Universal Config", href: "/config", icon: Database, roles: ["super_admin", "admin"], section: "settings" },
  { name: "Site Config", href: "/settings", icon: Settings, roles: ["super_admin", "admin"], section: "settings" },
  { name: "Auth", href: "/settings/auth", icon: Shield, roles: ["super_admin", "admin"], section: "settings" },
  { name: "Email", href: "/settings/email", icon: Mail, roles: ["super_admin", "admin"], section: "settings" },
  { name: "API Keys", href: "/api-keys", icon: Key, roles: ["super_admin", "admin"], section: "settings" },
  { name: "Integrations", href: "/integrations", icon: Link2, roles: ["super_admin", "admin"], section: "settings" },
  { name: "Accounts", href: "/accounts", icon: Layers, roles: ["super_admin", "admin"], section: "settings" },
  { name: "Site Domains", href: "/settings/site-domains", icon: Globe, roles: ["super_admin", "admin"], section: "settings" },
  { name: "Audit Log", href: "/security", icon: Shield, roles: ["super_admin", "admin"], section: "admin" },
  { name: "Notifications", href: "/admin/notifications", icon: Bell, roles: ["super_admin", "admin"], section: "admin" },
  { name: "Sessions", href: "/admin/sessions", icon: Radio, roles: ["super_admin", "admin"], section: "admin" },
  { name: "Backups", href: "/admin/backups", icon: HardDrive, roles: ["super_admin", "admin"], section: "admin" },
  { name: "Reports", href: "/admin/reports", icon: LineChart, roles: ["super_admin", "admin"], section: "admin" },
  { name: "Communities", href: "/admin/communities", icon: Users, roles: ["super_admin", "admin"], section: "admin" },
  { name: "Nav Manager", href: "/admin/nav", icon: Layers, roles: ["super_admin"], section: "admin" },
  { name: "System Health", href: "/admin/system-health", icon: Activity, roles: ["super_admin", "admin"], section: "admin" },
]

export default function Sidebar({ isOpen, onClose, userRole = "admin" }: { isOpen: boolean; onClose: () => void; userRole?: string }) {
  const filtered = navItems.filter(g => g.roles.includes(userRole))

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/70 z-40 lg:hidden animate-fade-in" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 z-50 h-full w-60 border-r border-border/40 bg-background transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 flex flex-col`}>
        <div className="flex h-12 items-center justify-between px-4 border-b border-border/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground tracking-tight">Tirbeo</span>
              <span className="hidden text-[9px] text-muted-foreground/40 ml-2 uppercase tracking-widest font-medium">Admin</span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            <PanelRight className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {sections.map(section => {
            const items = filtered.filter(g => g.section === section.key)
            if (!items.length) return null
            return (
              <div key={section.key} className="mb-5 last:mb-0">
                <div className="px-3 mb-1.5">
                  <span className="text-[9px] text-muted-foreground/30 uppercase tracking-[0.15em] font-semibold">{section.name}</span>
                </div>
                <div className="space-y-0.5">
                  {items.map(item => (
                    <NavLink key={item.name} to={item.href} end={item.href === "/"} onClick={onClose}
                      className={({ isActive }) =>
                        `group relative flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                          isActive
                            ? "bg-primary/[0.08] text-primary"
                            : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/30"
                        }`
                      }>
                      {({ isActive }) => (
                        <>
                          {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-primary" />}
                          <item.icon className={`h-3.5 w-3.5 shrink-0 transition-colors duration-150 ${isActive ? "text-primary" : "text-muted-foreground/40 group-hover:text-foreground/60"}`} />
                          <span className="truncate">{item.name}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
