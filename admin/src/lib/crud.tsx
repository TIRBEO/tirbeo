import { useState, useEffect, useCallback } from "react"
import { Plus, Edit, Trash2, Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Loader2, Save, X, Check } from "lucide-react"
import { supabase } from "./supabase"

export interface Column<T> {
  key: keyof T | string
  header: string
  render?: (row: T, idx: number) => React.ReactNode
  sortable?: boolean
  width?: string
  type?: "text" | "boolean" | "number" | "select"
  options?: { label: string; value: string }[]
}

export interface CrudPageProps<T> {
  table: string
  title: string
  columns: Column<T>[]
  orderBy?: string
  searchable?: string[]
  defaultSort?: { column: string; ascending: boolean }
  pageSize?: number
  transformRow?: (row: any) => T
  onRowClick?: (row: T) => void
}

function toast(msg: string) {
  const el = document.createElement("div")
  el.className = "fixed bottom-4 right-4 z-50 bg-foreground text-background text-xs font-medium px-4 py-2 rounded-lg shadow-2xl animate-slide-up"
  el.textContent = msg
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 2500)
}

function InputField({ value, onChange, placeholder, type, options }: { value: any; onChange: (v: any) => void; placeholder: string; type?: string; options?: { label: string; value: string }[] }) {
  if (type === "boolean") {
    return (
      <button type="button" onClick={() => onChange(!value)}
        className={`h-6 w-10 rounded-full transition-all duration-200 flex items-center ${value ? "bg-primary justify-end" : "bg-muted justify-start"} px-0.5`}>
        <div className={`h-4 w-4 rounded-full bg-white transition-transform duration-200 shadow-sm`} />
      </button>
    )
  }
  if (type === "select" && options) {
    return (
      <select value={value || ""} onChange={e => onChange(e.target.value)}
        className="w-full rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1.5 text-xs text-foreground focus:border-primary/50 focus:outline-none focus:ring-0 transition-colors appearance-none cursor-pointer">
        <option value="" className="bg-card">--</option>
        {options.map(o => <option key={o.value} value={o.value} className="bg-card">{o.label}</option>)}
      </select>
    )
  }
  return (
    <input type={type === "number" ? "number" : "text"} value={value ?? ""} onChange={e => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none transition-colors" />
  )
}

export function CrudPage<T extends Record<string, any>>({
  table, title, columns, searchable = [],
  defaultSort = { column: "created_at", ascending: false },
  pageSize = 25, transformRow, onRowClick
}: CrudPageProps<T>) {
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState(defaultSort)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Record<string, any>>({})
  const [creating, setCreating] = useState(false)
  const [newData, setNewData] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetchRows = useCallback(async () => {
    setLoading(true)
    let q = supabase.from(table).select("*", { count: "exact" })
    if (search && searchable.length > 0) {
      q = q.or(searchable.map(c => `${c}.ilike.%${search}%`).join(","))
    }
    q = q.order(sort.column, { ascending: sort.ascending }).range((page - 1) * pageSize, page * pageSize - 1)
    const { data, error, count } = await q
    if (!error) { setRows((data || []).map(r => transformRow ? transformRow(r) : r) as T[]); setTotal(count || 0) }
    setLoading(false)
  }, [table, search, searchable, sort, page, pageSize, transformRow])

  useEffect(() => { fetchRows() }, [fetchRows])

  const handleCreate = async () => {
    setSaving(true)
    const { error } = await supabase.from(table).insert(newData)
    if (!error) { setCreating(false); setNewData({}); fetchRows(); toast("Created successfully") }
    setSaving(false)
  }

  const handleUpdate = async (id: string) => {
    setSaving(true)
    const { error } = await supabase.from(table).update(editData).eq("id", id)
    if (!error) { setEditingId(null); setEditData({}); fetchRows(); toast("Updated successfully") }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from(table).delete().eq("id", id)
    if (!error) { fetchRows(); toast("Deleted successfully") }
    setDeleteConfirm(null)
  }

  const val = (r: T, c: Column<T>) => {
    if (c.render) return c.render(r, 0)
    const v = r[c.key as keyof T]
    if (c.type === "boolean") {
      return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${v ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
        <span className={`h-1 w-1 rounded-full ${v ? "bg-emerald-400" : "bg-muted-foreground"}`} />
        {v ? "Yes" : "No"}
      </span>
    }
    if (c.type === "select" && c.options) {
      const o = c.options.find(o => o.value === v)
      return <span className="text-xs">{o?.label || String(v ?? "")}</span>
    }
    return String(v ?? "")
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground/70 mt-0.5">{total} record{total !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
            <input type="text" placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-44 h-8 pl-8 pr-2.5 rounded-lg border border-border/60 bg-muted/30 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none transition-colors" />
          </div>
          {!creating && !editingId && (
            <button onClick={() => setCreating(true)} className="btn-primary h-8 text-xs">
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden card-hover">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/40">
                    {columns.map((col, i) => (
                      <th key={i} className="px-4 py-3 text-left font-medium text-muted-foreground/70 uppercase tracking-wider text-[10px] cursor-pointer hover:text-foreground select-none transition-colors" style={{ width: col.width }}
                        onClick={() => col.sortable && setSort({ column: col.key as string, ascending: sort.column === col.key ? !sort.ascending : true })}>
                        <div className="flex items-center gap-1">
                          {col.header}
                          {col.sortable && sort.column === col.key && (
                            sort.ascending ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground/70 uppercase tracking-wider text-[10px] w-20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {creating && (
                    <tr className="border-b border-border/20 bg-primary/[0.02] animate-fade-in">
                      {columns.map((col, i) => (
                        <td key={i} className="px-4 py-2.5">
                          {col.key === "id" ? (
                            <span className="text-muted-foreground/50 text-[10px]">Auto</span>
                          ) : (
                            <InputField value={newData[col.key as string]} onChange={v => setNewData({ ...newData, [col.key]: v })}
                              placeholder={col.header} type={col.type} options={col.options} />
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={handleCreate} disabled={saving}
                            className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 disabled:opacity-50 transition-colors">
                            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                          </button>
                          <button onClick={() => setCreating(false)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                  {rows.map((row, idx) => (
                    <tr key={row.id} className={`border-b border-border/15 transition-all duration-150 ${editingId === row.id ? "bg-primary/[0.02]" : "hover:bg-muted/20"}`}
                      onClick={() => !editingId && onRowClick?.(row)}>
                      {columns.map((col, i) => (
                        <td key={i} className={`px-4 py-3 text-foreground ${i === 0 ? "font-medium" : ""}`}>
                          {editingId === row.id ? (
                            col.key === "id" ? (
                              <span className="text-muted-foreground/50 text-[10px]">Auto</span>
                            ) : (
                              <InputField value={editData[col.key as string] ?? row[col.key as keyof T] ?? ""}
                                onChange={v => setEditData({ ...editData, [col.key]: v })}
                                placeholder={col.header} type={col.type} options={col.options} />
                            )
                          ) : (
                            <div className="truncate max-w-[280px]">{val(row, col)}</div>
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right">
                        {editingId === row.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleUpdate(row.id as string)} disabled={saving}
                              className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 disabled:opacity-50 transition-colors">
                              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                            </button>
                            <button onClick={() => { setEditingId(null); setEditData({}) }}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={e => { e.stopPropagation(); setEditingId(row.id as string); setEditData({ ...row }) }}
                              className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-muted/30 transition-colors">
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={e => { e.stopPropagation(); setDeleteConfirm(row.id as string) }}
                              className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && !creating && (
                    <tr>
                      <td colSpan={columns.length + 1} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center">
                            <Search className="h-4 w-4 text-muted-foreground/40" />
                          </div>
                          <p className="text-xs text-muted-foreground/60">No records found</p>
                          <button onClick={() => setCreating(true)} className="text-xs text-primary hover:underline">Add one</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border/40 bg-muted/10">
                <span className="text-[10px] text-muted-foreground/60">Page {page} of {totalPages}</span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-1.5 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <ChevronLeft className="h-3 w-3" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pn: number
                    if (totalPages <= 5) pn = i + 1
                    else if (page <= 3) pn = i + 1
                    else if (page >= totalPages - 2) pn = totalPages - 4 + i
                    else pn = page - 2 + i
                    return (
                      <button key={pn} onClick={() => setPage(pn)}
                        className={`h-7 w-7 rounded-lg text-[11px] font-medium transition-colors ${pn === page ? "bg-primary/15 text-primary" : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/30"}`}>
                        {pn}
                      </button>
                    )
                  })}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="p-1.5 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setDeleteConfirm(null)}>
          <div className="w-80 rounded-xl border border-border/60 bg-card p-6 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
                <Trash2 className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Delete record?</h3>
                <p className="text-xs text-muted-foreground/70 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setDeleteConfirm(null)} className="btn-ghost text-xs">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="rounded-lg bg-destructive px-3.5 py-1.5 text-xs font-medium text-destructive-foreground hover:opacity-90 transition-all flex items-center gap-1.5">
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
