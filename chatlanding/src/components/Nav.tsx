import { useState, useEffect, useCallback } from "react";
import { Menu, X, ArrowUpRight, LogOut, LayoutDashboard, Moon, Sun } from "lucide-react";
import { getSession, clearSession, type Session } from "@/lib/session";
import { loginUrl, signupUrl, DASHBOARD_URL } from "@/lib/config";

function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    setTheme(newTheme);
    try { localStorage.setItem("tirbeo-theme", newTheme); } catch {}
  };

  return (
    <button
      onClick={toggle}
      className={`relative flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition-colors hover:text-foreground hover:bg-secondary ${className}`}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}

export default function Nav() {
  const [session, setSession] = useState<Session | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setSession(getSession());
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const handleLogout = useCallback(() => {
    clearSession();
    setSession(null);
    setMenuOpen(false);
    setDropdownOpen(false);
  }, []);

  const closeAll = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border/40 backdrop-blur-xl bg-background/80 supports-[backdrop-filter]:bg-background/60"
          : "border-b border-transparent bg-transparent"
      }`}
      role="banner"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 group shrink-0" onClick={closeAll}>
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden transition-transform duration-200 group-hover:scale-105">
            <img src="/logo.png" alt="tirbeo" className="h-8 w-8 object-contain brightness-0 invert" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight text-foreground/90">
            tirbeo
          </span>
        </a>

        {/* Desktop Nav Links (stubs for scroll) */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main">
          <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</a>
          <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Pricing</a>
          <a href="#faq" className="text-sm text-muted-foreground transition-colors hover:text-foreground">FAQ</a>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle className="hidden sm:flex" />

          {session ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((p) => !p)}
                className="flex items-center gap-2 rounded-full bg-secondary/50 px-3 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground/10 text-xs font-semibold text-foreground">
                  {session.user.displayName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline">{session.user.displayName}</span>
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-border bg-card p-1.5ZTjAoG6SD-reset hover:shadow-h-lift">
                    <div className="border-b border-border px-3 py-2">
                      <p className="text-sm font-medium text-foreground">{session.user.displayName}</p>
                      <p className="text-xs text-muted-foreground">{session.user.email}</p>
                    </div>
                    <a
                      href={DASHBOARD_URL}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </a>
                    <hr className="my-1 border-border" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
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
                className="hidden sm:inline-flex text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign In
              </a>
              <a
                href={signupUrl()}
                className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-all hover:bg-foreground/90 active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-foreground"
              >
                Get Started
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden relative z-50 flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl md:hidden flex flex-col px-6 pt-24 pb-10 gap-6 animate-in slide-in-from-top-2 duration-200">
          <a href="#features" onClick={closeAll} className="text-lg font-medium text-foreground">Features</a>
          <a href="#pricing" onClick={closeAll} className="text-lg font-medium text-foreground">Pricing</a>
          <a href="#faq" onClick={closeAll} className="text-lg font-medium text-foreground">FAQ</a>
          <hr className="border-border" />
          <div className="flex flex-col gap-3">
            <a href={loginUrl()} className="text-center text-sm text-muted-foreground">Sign In</a>
            <a
              href={signupUrl()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
            >
              Get Started <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
