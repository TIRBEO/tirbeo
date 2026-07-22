"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home, User, Shield, Building2, Bell, Plug, Settings, Activity,
  HelpCircle, LogOut, Search, Menu, X, ChevronRight, Clock, FileText,
  Palette, Globe, Lock, Eye, BellRing, MessageSquare, BarChart3,
  KeyRound, Smartphone, Mail, Fingerprint, CreditCard, Users,
  Database, Download, Trash2, AlertTriangle, ExternalLink,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Me = {
  id: string; email: string; name: string | null; photoUrl: string | null;
  adminRole: string | null; is2FAEnabled: boolean;
  theme?: string; timeFormat?: string;
};

const NAV = [
  { href: "/dashboard", label: "Home", icon: Home, group: "main" },
  { href: "/dashboard/profile", label: "Profile", icon: User, group: "account" },
  { href: "/dashboard/security", label: "Security", icon: Shield, group: "account" },
  { href: "/dashboard/workspace", label: "Workspace", icon: Building2, group: "account" },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell, group: "main" },
  { href: "/dashboard/integrations", label: "Integrations", icon: Plug, group: "account" },
  { href: "/dashboard/preferences", label: "Preferences", icon: Settings, group: "main" },
  { href: "/dashboard/activity", label: "Activity", icon: Activity, group: "account" },
  { href: "/dashboard/help", label: "Help & Support", icon: HelpCircle, group: "main" },
];

type SearchItem = {
  label: string;
  href: string;
  icon: typeof Home;
  category: string;
  keywords: string[];
};

const SEARCH_INDEX: SearchItem[] = [
  { label: "Home", href: "/dashboard", icon: Home, category: "Navigation", keywords: ["home", "dashboard", "overview", "welcome"] },
  { label: "Profile", href: "/dashboard/profile", icon: User, category: "Account", keywords: ["profile", "personal", "name", "email", "avatar", "photo", "gender", "birthday", "bio", "contact", "phone", "address", "work"] },
  { label: "Security", href: "/dashboard/security", icon: Shield, category: "Account", keywords: ["security", "password", "2fa", "two-factor", "backup", "passkey", "recovery", "login", "session", "device"] },
  { label: "Workspace", href: "/dashboard/workspace", icon: Building2, category: "Account", keywords: ["workspace", "team", "members", "projects"] },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell, category: "Main", keywords: ["notifications", "alerts", "messages", "mentions", "system"] },
  { label: "Integrations", href: "/dashboard/integrations", icon: Plug, category: "Account", keywords: ["integrations", "connect", "google", "github", "oauth", "third-party"] },
  { label: "Preferences", href: "/dashboard/preferences", icon: Settings, category: "Main", keywords: ["preferences", "settings", "theme", "appearance", "language", "timezone", "font", "color", "layout", "style", "dark", "light", "customize"] },
  { label: "Activity", href: "/dashboard/activity", icon: Activity, category: "Account", keywords: ["activity", "audit", "log", "history", "events", "changes"] },
  { label: "Help & Support", href: "/dashboard/help", icon: HelpCircle, category: "Main", keywords: ["help", "support", "faq", "docs", "contact", "report"] },
  // Profile sub-items
  { label: "Personal Info", href: "/dashboard/profile", icon: User, category: "Profile", keywords: ["personal", "info", "name", "gender", "birthday", "country", "language"] },
  { label: "Contact Info", href: "/dashboard/profile", icon: Mail, category: "Profile", keywords: ["contact", "email", "phone", "website", "social"] },
  { label: "Work & Identity", href: "/dashboard/profile", icon: CreditCard, category: "Profile", keywords: ["work", "company", "occupation", "industry", "bio"] },
  { label: "Change Password", href: "/dashboard/security", icon: KeyRound, category: "Security", keywords: ["change", "password", "update"] },
  { label: "Two-Factor Auth", href: "/dashboard/security", icon: Smartphone, category: "Security", keywords: ["2fa", "two-factor", "authenticator", "totp"] },
  { label: "Passkeys", href: "/dashboard/security", icon: Fingerprint, category: "Security", keywords: ["passkey", "security key", "biometric"] },
  { label: "Backup Codes", href: "/dashboard/security", icon: FileText, category: "Security", keywords: ["backup", "codes", "recovery", "one-time"] },
  { label: "Recovery Options", href: "/dashboard/security", icon: AlertTriangle, category: "Security", keywords: ["recovery", "phone", "email", "restore"] },
  { label: "Active Sessions", href: "/dashboard/security", icon: Smartphone, category: "Security", keywords: ["session", "device", "signed in", "login"] },
  // Preferences sub-items
  { label: "Theme", href: "/dashboard/preferences", icon: Palette, category: "Preferences", keywords: ["theme", "dark", "light", "appearance", "color"] },
  { label: "Typography", href: "/dashboard/preferences", icon: Globe, category: "Preferences", keywords: ["font", "typography", "size", "text"] },
  { label: "Layout", href: "/dashboard/preferences", icon: Eye, category: "Preferences", keywords: ["layout", "sidebar", "width", "padding"] },
  { label: "Notifications Settings", href: "/dashboard/preferences", icon: BellRing, category: "Preferences", keywords: ["notification", "email", "digest", "alert"] },
  { label: "Data & Privacy", href: "/dashboard/preferences", icon: Database, category: "Preferences", keywords: ["data", "privacy", "export", "delete", "account"] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    fetch(`${API}/api/profile`, { credentials: "include" })
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (d) setUser(d); else window.location.href = `https://accounts.tirbeo.app/login?redirect=${encodeURIComponent(window.location.href)}`; })
      .catch(() => { window.location.href = `https://accounts.tirbeo.app/login?redirect=${encodeURIComponent(window.location.href)}`; })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const tick = () => {
      const fmt = user?.timeFormat === "24h" ? "HH:mm" : "h:mm a";
      setCurrentTime(new Date().toLocaleTimeString("en-US", fmt === "24h" ? { hour: "2-digit", minute: "2-digit", hour12: false } : { hour: "2-digit", minute: "2-digit" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [user?.timeFormat]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(o => !o); }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  const handleLogout = useCallback(async () => {
    await fetch(`${API}/api/auth/logout`, { method: "POST", credentials: "include" });
    window.location.href = "https://accounts.tirbeo.app/login";
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return SEARCH_INDEX.slice(0, 8);
    const q = searchQuery.toLowerCase();
    return SEARCH_INDEX.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.keywords.some(k => k.includes(q)) ||
      item.category.toLowerCase().includes(q)
    ).slice(0, 12);
  }, [searchQuery]);

  const recentSearches = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("tirbeo-recent-searches") || "[]").slice(0, 3); } catch { return []; }
  }, []);

  const saveRecentSearch = (href: string) => {
    try {
      const recent = JSON.parse(localStorage.getItem("tirbeo-recent-searches") || "[]");
      const updated = [href, ...recent.filter((r: string) => r !== href)].slice(0, 5);
      localStorage.setItem("tirbeo-recent-searches", JSON.stringify(updated));
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--bg)" }}>
        <div style={{ width: 32, height: 32, border: "2px solid rgba(255,255,255,0.08)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
      </div>
    );
  }

  const initials = user?.name ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : user?.email?.[0]?.toUpperCase() || "?";
  const isActive = (href: string) => href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
  const unreadCount = 0; // Will be fetched

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ width: "var(--sidebar-w)", background: "var(--bg-surface)", borderRight: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between px-5 h-14" style={{ borderBottom: "1px solid var(--border)" }}>
          <Link href="/dashboard" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
            <span className="text-sm font-bold tracking-[0.2em] uppercase" style={{ color: "var(--text)" }}>Tirbeo</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden" style={{ color: "var(--text-muted)" }}><X size={16} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-0.5">
          {NAV.map(n => {
            const Icon = n.icon;
            const active = isActive(n.href);
            return (
              <Link key={n.href} href={n.href} className={`sidebar-link ${active ? "active" : ""}`}>
                <Icon size={16} strokeWidth={active ? 2 : 1.5} />
                <span>{n.label}</span>
                {n.label === "Notifications" && unreadCount > 0 && (
                  <span style={{ marginLeft: "auto", background: "#4f7aff", color: "#fff", fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 8 }}>{unreadCount}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-3" style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}>
          <Link href="/dashboard/profile" className="flex items-center gap-3 px-2 mb-2" style={{ textDecoration: "none" }}>
            <div className="avatar" style={{ width: 32, height: 32, fontSize: 11 }}>
              {user?.photoUrl ? <img src={user.photoUrl} alt="" /> : initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{user?.name || "User"}</p>
              <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{user?.email}</p>
            </div>
          </Link>
          <button onClick={handleLogout} className="sidebar-link w-full" style={{ color: "var(--text-muted)", fontSize: 12 }}>
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen" style={{ marginLeft: "var(--sidebar-w)" }}>
        <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 md:px-6"
          style={{ background: "rgba(7,8,10,0.85)", backdropFilter: "blur(24px)", borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden" style={{ color: "var(--text-secondary)" }}>
              <Menu size={20} />
            </button>
            <button onClick={() => setSearchOpen(true)} className="flex items-center gap-2 px-3 h-9 rounded-xl text-sm"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)", minWidth: 200, cursor: "pointer" }}>
              <Search size={14} />
              <span className="hidden sm:inline">Search everything...</span>
              <kbd className="hidden sm:inline text-xs px-1.5 py-0.5 rounded ml-auto" style={{ background: "var(--accent-muted)", color: "var(--text-ash)", fontSize: 10 }}>⌘K</kbd>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 h-9 rounded-xl text-xs font-medium"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
              <Clock size={12} />
              <span>{currentTime}</span>
            </div>
            <Link href="/dashboard/notifications" className="relative flex items-center justify-center w-9 h-9 rounded-xl"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <Bell size={14} style={{ color: "var(--text-muted)" }} />
              {unreadCount > 0 && (
                <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: "#4f7aff" }} />
              )}
            </Link>
            <Link href="/dashboard/profile" className="avatar" style={{ width: 32, height: 32, fontSize: 11, textDecoration: "none" }}>
              {user?.photoUrl ? <img src={user.photoUrl} alt="" /> : initials}
            </Link>
          </div>
        </header>

        <main className="flex-1 animate-in" style={{ padding: "28px 24px 48px" }}>
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {searchOpen && (
        <div className="search-overlay" onClick={() => setSearchOpen(false)}>
          <div className="search-modal" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-5" style={{ borderBottom: "1px solid var(--border)", height: 56 }}>
              <Search size={16} style={{ color: "var(--text-muted)" }} />
              <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search settings, pages, actions..."
                className="flex-1 bg-transparent border-none outline-none text-sm" style={{ color: "var(--text)" }} />
              <kbd className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--accent-muted)", color: "var(--text-muted)" }}>ESC</kbd>
            </div>

            {!searchQuery.trim() && recentSearches.length > 0 && (
              <div className="px-4 pt-3 pb-1">
                <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-ash)" }}>Recent</p>
              </div>
            )}

            <div className="max-h-96 overflow-y-auto px-2 py-2">
              {searchResults.map(item => {
                const Icon = item.icon;
                return (
                  <Link key={item.href + item.label} href={item.href} onClick={() => { setSearchOpen(false); setSearchQuery(""); saveRecentSearch(item.href); }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm"
                    style={{ color: "var(--text-secondary)", textDecoration: "none" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--accent-muted)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <Icon size={15} style={{ color: "var(--text-muted)" }} />
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 13, color: "var(--text)" }}>{item.label}</p>
                      <p style={{ fontSize: 11, color: "var(--text-ash)" }}>{item.category}</p>
                    </div>
                    <ChevronRight size={14} style={{ color: "var(--text-ash)" }} />
                  </Link>
                );
              })}
              {searchResults.length === 0 && (
                <div className="empty-state" style={{ padding: "32px 16px" }}>
                  <Search size={24} style={{ color: "var(--text-ash)", marginBottom: 8 }} />
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No results for "{searchQuery}"</p>
                  <p style={{ fontSize: 11, color: "var(--text-ash)", marginTop: 4 }}>Try searching for pages, settings, or actions</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderTop: "1px solid var(--border)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)" }} />
              <span style={{ fontSize: 11, color: "var(--text-ash)" }}>Tip: Use ⌘K anywhere to search</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
