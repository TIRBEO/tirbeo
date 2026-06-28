import { useState, useEffect } from "react";
import { ArrowUpRight, LogOut, LayoutDashboard } from "lucide-react";
import { getSession, clearSession, type Session } from "@/lib/session";
import { loginUrl, signupUrl, DASHBOARD_URL } from "@/lib/config";

export default function Nav() {
  const [session, setSession] = useState<Session | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setSession(getSession());
  }, []);

  const handleLogout = () => {
    clearSession();
    setSession(null);
    setMenuOpen(false);
  };




  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 backdrop-blur-xl" style={{ background: "oklch(0 0 0 / 0.6)" }}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
            <img src="/logo.png" alt="tirbeo" className="h-8 w-8 object-contain brightness-0 invert" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight text-foreground/90">
            tirbeo
          </span>
        </a>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {session ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-full bg-secondary/50 px-3 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground/10 text-xs font-semibold text-foreground">
                  {session.user.displayName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline">{session.user.displayName}</span>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-border bg-card p-1.5 shadow-lift backdrop-blur-xl">
                    <div className="border-b border-border px-3 py-2">
                      <p className="text-sm font-medium text-foreground">{session.user.displayName}</p>
                      <p className="text-xs text-ink-soft">{session.user.email}</p>
                    </div>
                    <a
                      href={DASHBOARD_URL}

                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </a>
                    <hr className="my-1 border-border" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-secondary hover:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <a
                href={loginUrl()}
                className="text-sm text-ink-soft transition-colors hover:text-foreground"
              >
                Sign In
              </a>
              <a
                href={signupUrl()}
                className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-all hover:bg-foreground/90 active:scale-95"
              >
                Get Started
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
