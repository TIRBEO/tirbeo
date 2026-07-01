import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { Loader2, Sparkles } from "lucide-react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    try { if (sessionStorage.getItem("admin_session")) navigate("/", { replace: true }) } catch {}
  }, [navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError || !data.user) { setError(authError?.message || "Login failed"); setLoading(false); return }
    const { data: adminData } = await supabase.from("admin_users").select("role").eq("user_id", data.user.id).single()
    sessionStorage.setItem("admin_session", JSON.stringify({ id: data.user.id, email: data.user.email, role: adminData?.role || "viewer" }))
    setLoading(false)
    navigate("/")
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
      <div className="w-full max-w-xs mx-auto relative">
        <div className="bg-card border border-border/60 rounded-xl p-6 shadow-xl">
          <div className="flex flex-col items-center mb-6">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center mb-3">
              <Sparkles className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <h1 className="text-sm font-semibold text-foreground">Tirbeo</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">Sign in to admin panel</p>
          </div>
          {error && <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-[11px] text-destructive">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-[11px] text-muted-foreground mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" required autoFocus
                className="w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-[11px] text-muted-foreground mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required
                className="w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none transition-colors" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5">
              {loading && <Loader2 className="h-3 w-3 animate-spin" />}
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
