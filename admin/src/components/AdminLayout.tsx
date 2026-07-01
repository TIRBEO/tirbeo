import { useState, useEffect } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { Menu, LogOut, ChevronDown, Settings } from "lucide-react"
import Sidebar from "./Sidebar"
import { supabase } from "../lib/supabase"

function getSession() {
  try { return JSON.parse(sessionStorage.getItem("admin_session") || "") } catch { return null }
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()
  const session = getSession()

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest("[data-dd]")) setDropdownOpen(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    sessionStorage.removeItem("admin_session")
    navigate("/login")
  }

  const email = session?.email || ""
  const initial = email.charAt(0).toUpperCase() || "A"
  const role = session?.role || "viewer"

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={role} />
      <div className="lg:pl-60 transition-all duration-300">
        <header className="sticky top-0 z-30 border-b border-border/30 bg-background/90 backdrop-blur-xl">
          <div className="flex h-12 items-center justify-between px-5">
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <Menu className="h-4 w-4" />
            </button>
            <div className="hidden lg:flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-muted-foreground/50 font-medium">Online</span>
            </div>
            <div className="flex-1" />
            <div className="relative" data-dd>
              <button onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 hover:bg-muted/50 transition-colors group">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-[10px] font-semibold text-primary-foreground shadow-sm">
                  {initial}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-medium text-foreground leading-tight">{email ? email.split("@")[0] : "Admin"}</p>
                  <p className="text-[9px] text-muted-foreground/50 capitalize leading-tight">{role.replace("_", " ")}</p>
                </div>
                <ChevronDown className={`h-3 w-3 text-muted-foreground/50 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-48 rounded-xl border border-border/50 bg-card py-1.5 shadow-2xl z-50 animate-scale-in">
                  <div className="px-3 pb-2 mb-1 border-b border-border/30">
                    <p className="text-xs font-medium text-foreground truncate">{email || "admin@tirbeo.com"}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5 capitalize">{role.replace("_", " ")}</p>
                  </div>
                  <div className="px-1">
                    <button onClick={() => { setDropdownOpen(false); navigate("/settings") }}
                      className="flex w-full items-center px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-lg transition-colors">
                      <Settings className="h-3.5 w-3.5 mr-2" /> Settings
                    </button>
                  </div>
                  <div className="border-t border-border/30 mt-1 pt-1 px-1">
                    <button onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                      <LogOut className="h-3.5 w-3.5" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="p-5 lg:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

