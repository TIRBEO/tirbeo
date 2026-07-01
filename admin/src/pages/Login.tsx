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
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="w-full max-w-sm mx-auto relative px-4">
        <div className="text-center mb-8 animate-fade-in">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Tirbeo Admin</h1>
          <p className="text-sm text-muted-foreground/70 mt-1">Sign in to your account</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-2xl animate-slide-up">
          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-3.5 py-2.5 text-xs text-destructive flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@tirbeo.com" required autoFocus
                className="w-full rounded-lg border border-border/60 bg-muted/30 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_rgba(107,92,247,0.12)] transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required
                className="w-full rounded-lg border border-border/60 bg-muted/30 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_rgba(107,92,247,0.12)] transition-all" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-primary to-primary/90 px-3.5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
