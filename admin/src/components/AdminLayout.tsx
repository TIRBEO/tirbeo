import { useState, useEffect } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { Menu, LogOut, ChevronDown } from "lucide-react"
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
      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-lg">
          <div className="flex h-12 items-center justify-between px-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex-1" />
            <div className="relative" data-dd>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-muted/50 transition-colors">
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-medium text-primary-foreground">{initial}</div>
                <span className="hidden sm:block text-xs text-foreground">{email ? email.split("@")[0] : "Admin"}</span>
                <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-48 rounded-lg border border-border/60 bg-card py-1 shadow-xl z-50">
                  <div className="px-3 py-2 border-b border-border/30">
                    <p className="text-xs font-medium text-foreground truncate">{email || "admin@tirbeo.com"}</p>
                    <p className="text-[10px] text-muted-foreground">{role}</p>
                  </div>
                  <div className="pt-1">
                    <button onClick={() => { setDropdownOpen(false); navigate("/settings") }} className="flex w-full items-center px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30">Settings</button>
                  </div>
                  <div className="border-t border-border/30 mt-0.5 pt-0.5">
                    <button onClick={handleLogout} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10">
                      <LogOut className="h-3 w-3" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
