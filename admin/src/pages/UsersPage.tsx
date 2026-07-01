import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { Loader2, Search } from "lucide-react"

interface UserProfile { id: string; user_id: string; email: string; display_name: string; avatar_url: string | null; is_active: boolean; created_at: string }

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 25

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    setLoading(true)
    const { data, error } = await supabase.from("user_profiles").select("*").order("created_at", { ascending: false })
    if (!error && data) setUsers(data)
    setLoading(false)
  }

  const filtered = users.filter(u => (u.display_name || "").toLowerCase().includes(search.toLowerCase()) || (u.email || "").toLowerCase().includes(search.toLowerCase()))
  const totalPages = Math.ceil(filtered.length / pageSize)
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>

  return (
    <div className="max-w-6xl space-y-5">
      <div>
        <h1 className="text-sm font-semibold text-foreground">Users</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{users.length} registered</p>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <input type="text" placeholder="Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="w-full h-8 pl-8 pr-3 rounded-lg border border-border/60 bg-card text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none transition-colors" />
      </div>

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Joined</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">ID</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(user => (
              <tr key={user.id} className="border-b border-border/15 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary">{user.display_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "?"}</div>
                    <span className="text-foreground">{user.email || "N/A"}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-foreground">{user.display_name || "-"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium border ${user.is_active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-muted text-muted-foreground border-border/40"}`}>
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3"><code className="text-[10px] text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded">{user.user_id.slice(0, 8)}...</code></td>
              </tr>
            ))}
            {!paged.length && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground text-xs">No users</td></tr>}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
            <span className="text-[10px] text-muted-foreground">Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-2.5 py-1 rounded-lg border border-border/60 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30">Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2.5 py-1 rounded-lg border border-border/60 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
