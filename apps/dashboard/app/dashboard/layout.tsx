"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home, User, Shield, Building2, Bell, Plug, Settings, Activity,
  HelpCircle, LogOut, Search, Menu, X, ChevronRight,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Me = {
  id: string; email: string; name: string | null; photoUrl: string | null;
  adminRole: string | null; is2FAEnabled: boolean;
};

const NAV = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/security", label: "Security", icon: Shield },
  { href: "/dashboard/workspace", label: "Workspace", icon: Building2 },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/integrations", label: "Integrations", icon: Plug },
  { href: "/dashboard/preferences", label: "Preferences", icon: Settings },
  { href: "/dashboard/activity", label: "Activity", icon: Activity },
  { href: "/dashboard/help", label: "Help & Support", icon: HelpCircle },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch(`${API}/api/profile`, { credentials: "include" })
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (d) setUser(d); else window.location.href = `https://accounts.tirbeo.app/login?redirect=${encodeURIComponent(window.location.href)}`; })
      .catch(() => { window.location.href = `https://accounts.tirbeo.app/login?redirect=${encodeURIComponent(window.location.href)}`; })
      .finally(() => setLoading(false));
  }, []);

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

  const filteredNav = NAV.filter(n => n.label.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--bg)" }}>
        <div style={{ width: 32, height: 32, border: "2px solid rgba(255,255,255,0.08)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  const initials = user?.name ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : user?.email?.[0]?.toUpperCase() || "?";
  const isActive = (href: string) => href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ width: "var(--sidebar-w)", background: "var(--bg-surface)", borderRight: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between px-5 h-16" style={{ borderBottom: "1px solid var(--border)" }}>
          <span className="text-sm font-bold tracking-[0.2em] uppercase" style={{ color: "var(--text)" }}>Tirbeo</span>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden" style={{ color: "var(--text-muted)" }}><X size={18} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5">
          {NAV.map(n => {
            const Icon = n.icon;
            const active = isActive(n.href);
            return (
              <Link key={n.href} href={n.href} className={`sidebar-link ${active ? "active" : ""}`}>
                <Icon size={18} strokeWidth={active ? 2 : 1.5} />
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-4" style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
              {user?.photoUrl ? <img src={user.photoUrl} alt="" /> : initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{user?.name || "User"}</p>
              <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="sidebar-link w-full" style={{ color: "var(--text-muted)" }}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen" style={{ marginLeft: "var(--sidebar-w)" }}>
        <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 md:px-6"
          style={{ background: "rgba(11,11,13,0.8)", backdropFilter: "blur(24px)", borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden" style={{ color: "var(--text-secondary)" }}>
              <Menu size={20} />
            </button>
            <button onClick={() => setSearchOpen(true)} className="flex items-center gap-2 px-3 h-8 rounded-lg text-sm"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
              <Search size={14} />
              <span className="hidden sm:inline">Search settings...</span>
              <kbd className="hidden sm:inline text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--accent-muted)", color: "var(--text-muted)" }}>⌘K</kbd>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="avatar" style={{ width: 30, height: 30, fontSize: 11 }}>
              {user?.photoUrl ? <img src={user.photoUrl} alt="" /> : initials}
            </div>
          </div>
        </header>

        <main className="flex-1 animate-in" style={{ padding: "24px 20px 48px" }}>
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {searchOpen && (
        <div className="search-overlay" onClick={() => setSearchOpen(false)}>
          <div className="search-modal" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-4" style={{ borderBottom: "1px solid var(--border)", height: 52 }}>
              <Search size={16} style={{ color: "var(--text-muted)" }} />
              <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search anything..."
                className="flex-1 bg-transparent border-none outline-none text-sm" style={{ color: "var(--text)" }} />
              <kbd className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--accent-muted)", color: "var(--text-muted)" }}>ESC</kbd>
            </div>
            <div className="max-h-80 overflow-y-auto px-2 py-2">
              {filteredNav.map(n => {
                const Icon = n.icon;
                return (
                  <Link key={n.href} href={n.href} onClick={() => setSearchOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm" style={{ color: "var(--text-secondary)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--accent-muted)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <Icon size={16} />
                    <span className="flex-1">{n.label}</span>
                    <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
                  </Link>
                );
              })}
              {filteredNav.length === 0 && <p className="text-sm px-3 py-4" style={{ color: "var(--text-muted)" }}>No results found</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
