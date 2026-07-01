import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react"

interface NavItem { id: string; label: string; href: string; page_name: string | null; group_name: string; min_role: string; feature_toggle: string | null; sort_order: number; is_enabled: boolean }

const groups = ["Main", "Content", "Moderation", "Settings", "Admin"]
const roles = ["viewer", "editor", "manager", "admin", "super_admin"]

export default function NavManagerPage() {
  const [items, setItems] = useState<NavItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newItem, setNewItem] = useState({ label: "", href: "", group_name: "Content", min_role: "editor", sort_order: 0 })
  const [adding, setAdding] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => { fetchItems() }, [])

  async function fetchItems() {
    setLoading(true)
    const { data, error } = await supabase.from("admin_nav_items").select("*").order("sort_order")
    if (!error && data) setItems(data)
    setLoading(false)
  }

  async function handleAdd() {
    if (!newItem.label || !newItem.href) return
    setAdding(true)
    await supabase.from("admin_nav_items").insert({ ...newItem, is_enabled: true })
    setShowAdd(false); setNewItem({ label: "", href: "", group_name: "Content", min_role: "editor", sort_order: 0 }); fetchItems()
    setAdding(false)
  }

  async function handleToggle(id: string, enabled: boolean) {
    await supabase.from("admin_nav_items").update({ is_enabled: enabled }).eq("id", id)
    fetchItems()
  }

  async function handleDelete(id: string) {
    await supabase.from("admin_nav_items").delete().eq("id", id)
    setDeleteConfirm(null); fetchItems()
  }

  const grouped = items.reduce<Record<string, NavItem[]>>((a, item) => { (a[item.group_name] = a[item.group_name] || []).push(item); return a }, {})

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-foreground">Navigation</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{items.length} items</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1 h-8 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-3 w-3" /> Add
        </button>
      </div>

      {Object.entries(grouped).map(([group, navItems]) => (
        <div key={group}>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">{group}</p>
          <div className="rounded-xl border border-border/50 bg-card divide-y divide-border/20">
            {navItems.sort((a, b) => a.sort_order - b.sort_order).map(item => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/10 transition-colors">
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground">{item.label}</span>
                    <code className="text-[10px] text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded">{item.href}</code>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground">Role: {item.min_role}</span>
                    {item.feature_toggle && <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">{item.feature_toggle}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleToggle(item.id, !item.is_enabled)} className={`relative w-9 h-5 rounded-full transition-colors ${item.is_enabled ? "bg-primary" : "bg-muted"}`}>
                    <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-background transition-transform ${item.is_enabled ? "left-4" : "left-0.5"}`} />
                  </button>
                  <button onClick={() => setDeleteConfirm(item.id)} className="p-1 rounded text-muted-foreground/60 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-xl border border-border/60 bg-card p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-foreground mb-4">Add Item</h3>
            <div className="space-y-3">
              <div><label className="block text-xs text-muted-foreground mb-1">Label</label>
                <input type="text" value={newItem.label} onChange={e => setNewItem({ ...newItem, label: e.target.value })}
                  className="w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 text-xs text-foreground focus:border-primary/50 focus:outline-none" /></div>
              <div><label className="block text-xs text-muted-foreground mb-1">Href</label>
                <input type="text" value={newItem.href} onChange={e => setNewItem({ ...newItem, href: e.target.value })}
                  className="w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 text-xs text-foreground focus:border-primary/50 focus:outline-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-muted-foreground mb-1">Group</label>
                  <select value={newItem.group_name} onChange={e => setNewItem({ ...newItem, group_name: e.target.value })}
                    className="w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 text-xs text-foreground focus:outline-none">
                    {groups.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs text-muted-foreground mb-1">Min Role</label>
                  <select value={newItem.min_role} onChange={e => setNewItem({ ...newItem, min_role: e.target.value })}
                    className="w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 text-xs text-foreground focus:outline-none">
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowAdd(false)} className="rounded-lg border border-border/60 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={handleAdd} disabled={!newItem.label || !newItem.href || adding}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {adding ? <Loader2 className="h-3 w-3 animate-spin" /> : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-80 rounded-xl border border-border/60 bg-card p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-foreground">Delete item?</h3>
            <p className="text-xs text-muted-foreground mt-1">This cannot be undone.</p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setDeleteConfirm(null)} className="rounded-lg border border-border/60 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:bg-destructive/90">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
