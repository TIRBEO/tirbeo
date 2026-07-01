import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { Loader2, Save, Shield } from "lucide-react"

interface Permission { id?: string; resource: string; role: string; actions: string[] }

const resources = ["landing_pages", "blog_posts", "channels", "announcements", "config", "admin_users", "api_keys", "integrations", "admin_nav_items", "system_health", "admin_audit_log"]
const roles = ["super_admin", "admin", "manager", "editor", "viewer"]
const actions = ["create", "read", "update", "delete", "manage"] as const

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Record<string, Record<string, string[]>>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const { data, error } = await supabase.from("admin_permissions").select("*")
    if (!error && data) {
      const m: Record<string, Record<string, string[]>> = {}
      data.forEach((p: Permission) => { if (!m[p.resource]) m[p.resource] = {}; m[p.resource][p.role] = p.actions })
      setPermissions(m)
    }
    setLoading(false)
  }

  function toggle(r: string, role: string, action: string) {
    const current = permissions[r]?.[role] || []
    setPermissions(p => ({ ...p, [r]: { ...p[r], [role]: current.includes(action) ? current.filter(a => a !== action) : [...current, action] } }))
  }

  async function handleSave() {
    setSaving(true)
    const rows = Object.entries(permissions).flatMap(([r, rm]) => Object.entries(rm).map(([role, acts]) => ({ resource: r, role, actions: acts })))
    await supabase.from("admin_permissions").upsert(rows, { onConflict: "resource,role" })
    setSaving(false)
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-foreground">Permissions</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Role-based access control</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 h-8 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          <Save className="h-3 w-3" /> {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground w-40">Resource</th>
              {roles.map(r => <th key={r} className="px-3 py-3 text-center font-medium text-muted-foreground"><div className="flex items-center justify-center gap-1"><Shield className="h-3 w-3" />{r}</div></th>)}
            </tr>
          </thead>
          <tbody>
            {resources.map(resource => (
              <tr key={resource} className="border-b border-border/15 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{resource}</td>
                {roles.map(role => (
                  <td key={role} className="px-2 py-2">
                    <div className="flex flex-wrap justify-center gap-1">
                      {actions.map(action => (
                        <label key={action} className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer"
                            checked={permissions[resource]?.[role]?.includes(action) || false}
                            onChange={() => toggle(resource, role, action)} />
                          <span className="h-6 w-6 rounded border border-border/60 bg-muted/20 flex items-center justify-center text-[10px] text-muted-foreground peer-checked:border-primary/50 peer-checked:bg-primary/10 peer-checked:text-primary transition-all">
                            {action[0].toUpperCase()}
                          </span>
                        </label>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
