import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { Loader2, Plus, Trash2, Shield, ChevronDown, Key, Search } from "lucide-react"

interface AdminUser { id: string; user_id: string; email: string; role: string; permissions: Record<string, unknown>; created_by: string | null; updated_at: string; created_at: string }

const roleOptions = ["super_admin", "admin", "manager", "editor", "viewer"]
const roleColors: Record<string, string> = {
  super_admin: "bg-red-500/10 text-red-400 border-red-500/20",
  admin: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  manager: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  editor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  viewer: "bg-muted text-muted-foreground border-border/40",
}

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [lookupEmail, setLookupEmail] = useState("")
  const [lookupResult, setLookupResult] = useState<{ id: string; email: string } | null>(null)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState("editor")
  const [adding, setAdding] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [resetModal, setResetModal] = useState<{ id: string; email: string; userId: string } | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [resetting, setResetting] = useState(false)

  useEffect(() => { fetchAdminUsers() }, [])

  async function fetchAdminUsers() {
    setLoading(true)
    const { data, error } = await supabase.from("admin_users").select("*").order("created_at", { ascending: false })
    if (!error && data) {
      const enriched = await Promise.all(data.map(async (au) => {
        const { data: p } = await supabase.from("user_profiles").select("email").eq("user_id", au.user_id).single()
        return { ...au, email: p?.email || "unknown" }
      }))
      setUsers(enriched)
    }
    setLoading(false)
  }

  async function handleLookup() {
    if (!lookupEmail.trim()) return
    setLookupLoading(true)
    const { data, error } = await supabase.rpc("lookup_user_by_email", { target_email: lookupEmail.trim() })
    if (!error && data?.length > 0) setLookupResult(data[0])
    else setLookupResult(null)
    setLookupLoading(false)
  }

  async function handleAdd() {
    if (!lookupResult) return
    setAdding(true)
    await supabase.from("admin_users").insert({ user_id: lookupResult.id, role: selectedRole })
    setShowAdd(false); setLookupEmail(""); setLookupResult(null); fetchAdminUsers()
    setAdding(false)
  }

  async function handleDelete(id: string) {
    await supabase.from("admin_users").delete().eq("id", id)
    setDeleteConfirm(null); fetchAdminUsers()
  }

  async function handleRoleChange(id: string, role: string) {
    await supabase.from("admin_users").update({ role, updated_at: new Date().toISOString() }).eq("id", id)
    fetchAdminUsers()
  }

  async function handleReset() {
    if (!resetModal || newPassword !== confirmPassword || newPassword.length < 6) return
    setResetting(true)
    await supabase.rpc("admin_update_user_password", { target_user_id: resetModal.userId, new_password: newPassword })
    setResetModal(null); setNewPassword(""); setConfirmPassword("")
    setResetting(false)
  }

  const filtered = users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()) || u.role.includes(search))

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-foreground">Admin Users</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{users.length} total</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1 h-8 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-3 w-3" /> Add
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <input type="text" placeholder="Search by email or role..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full h-8 pl-8 pr-3 rounded-lg border border-border/60 bg-card text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none transition-colors" />
      </div>

      {/* Stats */}
      <div className="flex gap-3">
        {roleOptions.map(r => (
          <div key={r} className="flex-1 bg-card border border-border/50 rounded-xl p-3 text-center">
            <p className="text-lg font-semibold text-foreground tabular-nums">{users.filter(u => u.role === r).length}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{r.replace("_", " ")}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">ID</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Added</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground w-20">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user.id} className="border-b border-border/15 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary">{user.email?.charAt(0).toUpperCase() || "?"}</div>
                    <span className="text-foreground">{user.email}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="relative inline-block">
                    <select value={user.role} onChange={e => handleRoleChange(user.id, e.target.value)}
                      className={`appearance-none rounded-lg border px-2.5 py-1 pr-6 text-[10px] font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${roleColors[user.role] || "bg-muted text-muted-foreground"}`}>
                      {roleOptions.map(r => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-2.5 w-2.5 pointer-events-none text-muted-foreground" />
                  </div>
                </td>
                <td className="px-4 py-3"><code className="text-[10px] text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded">{user.user_id.slice(0, 8)}...</code></td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-0.5">
                    <button onClick={() => setResetModal({ id: user.id, email: user.email, userId: user.user_id })} className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-amber-400 hover:bg-amber-500/10" title="Reset Password"><Key className="h-3 w-3" /></button>
                    <button onClick={() => setDeleteConfirm(user.id)} className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-red-400 hover:bg-red-500/10"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground text-xs">No users</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-xl border border-border/60 bg-card p-5 shadow-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><Shield className="h-4.5 w-4.5 text-primary" /></div>
              <div><h3 className="text-sm font-semibold text-foreground">Add Admin</h3><p className="text-xs text-muted-foreground">Look up a user by email</p></div>
            </div>
            <div className="space-y-3">
              <div><label className="block text-xs text-muted-foreground mb-1">Email</label>
                <div className="flex gap-2">
                  <input type="email" value={lookupEmail} onChange={e => setLookupEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLookup()} placeholder="user@example.com"
                    className="flex-1 rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none" />
                  <button onClick={handleLookup} disabled={lookupLoading} className="rounded-lg border border-border/60 bg-muted/50 px-3 py-1.5 text-xs text-foreground hover:bg-muted disabled:opacity-50">
                    {lookupLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Find"}
                  </button>
                </div>
              </div>
              {lookupResult && <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5"><p className="text-xs text-emerald-400 font-medium">Found</p><p className="text-xs text-foreground">{lookupResult.email}</p></div>}
              {lookupResult && (
                <div><label className="block text-xs text-muted-foreground mb-1">Role</label>
                  <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)}
                    className="w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 text-xs text-foreground focus:border-primary/50 focus:outline-none">
                    {roleOptions.map(r => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => { setShowAdd(false); setLookupEmail(""); setLookupResult(null) }} className="rounded-lg border border-border/60 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handleAdd} disabled={!lookupResult || adding} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {adding ? <Loader2 className="h-3 w-3 animate-spin" /> : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-80 rounded-xl border border-border/60 bg-card p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-foreground">Remove admin?</h3>
            <p className="text-xs text-muted-foreground mt-1">This cannot be undone.</p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setDeleteConfirm(null)} className="rounded-lg border border-border/60 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:bg-destructive/90">Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset modal */}
      {resetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-xl border border-border/60 bg-card p-5 shadow-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center"><Key className="h-4.5 w-4.5 text-amber-400" /></div>
              <div><h3 className="text-sm font-semibold text-foreground">Reset Password</h3><p className="text-xs text-muted-foreground">{resetModal.email}</p></div>
            </div>
            <div className="space-y-3">
              <div><label className="block text-xs text-muted-foreground mb-1">New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 6 characters"
                  className="w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none" /></div>
              <div><label className="block text-xs text-muted-foreground mb-1">Confirm</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter"
                  className="w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none" /></div>
              {confirmPassword && newPassword !== confirmPassword && <p className="text-[10px] text-red-400">Passwords don't match</p>}
              {newPassword.length > 0 && newPassword.length < 6 && <p className="text-[10px] text-amber-400">Minimum 6 characters</p>}
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => { setResetModal(null); setNewPassword(""); setConfirmPassword("") }} className="rounded-lg border border-border/60 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={handleReset} disabled={!newPassword || newPassword !== confirmPassword || newPassword.length < 6 || resetting}
                className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-amber-500 disabled:opacity-50">
                {resetting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Reset"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
