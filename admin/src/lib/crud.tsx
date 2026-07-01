import { useState, useEffect, useCallback } from "react"
import { Plus, Edit, Trash2, Search, ChevronDown, ChevronUp, Loader2, Save, X } from "lucide-react"
import { supabase } from "./supabase"

export interface Column<T> {
  key: keyof T | string
  header: string
  render?: (row: T, idx: number) => React.ReactNode
  sortable?: boolean
  width?: string
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
    if (search && searchable.length > 0) q = q.or(searchable.map(c => `${c}.ilike.%${search}%`).join(","))
    q = q.order(sort.column, { ascending: sort.ascending }).range((page - 1) * pageSize, page * pageSize - 1)
    const { data, error, count } = await q
    if (!error) { setRows((data || []).map(r => transformRow ? transformRow(r) : r) as T[]); setTotal(count || 0) }
    setLoading(false)
  }, [table, search, searchable, sort, page, pageSize, transformRow])

  useEffect(() => { fetchRows() }, [fetchRows])

  const handleCreate = async () => {
    setSaving(true)
    const { error } = await supabase.from(table).insert(newData)
    if (!error) { setCreating(false); setNewData({}); fetchRows() }
    setSaving(false)
  }

  const handleUpdate = async (id: string) => {
    setSaving(true)
    const { error } = await supabase.from(table).update(editData).eq("id", id)
    if (!error) { setEditingId(null); setEditData({}); fetchRows() }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from(table).delete().eq("id", id)
    if (!error) fetchRows()
    setDeleteConfirm(null)
  }

  const val = (r: T, c: Column<T>) => c.render ? c.render(r, 0) : String(r[c.key as keyof T] ?? "")

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{total} records</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <input type="text" placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-48 h-8 pl-8 pr-2.5 rounded-lg border border-border/60 bg-muted/30 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none transition-colors" />
          </div>
          {!creating && !editingId && (
            <button onClick={() => setCreating(true)} className="flex items-center gap-1 h-8 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              <Plus className="h-3 w-3" /> Add
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        {loading ? <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/40">
                    {columns.map((col, i) => (
                      <th key={i} className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none" style={{ width: col.width }}
                        onClick={() => col.sortable && setSort({ column: col.key as string, ascending: sort.column === col.key ? !sort.ascending : true })}>
                        <div className="flex items-center gap-1">
                          {col.header}
                          {col.sortable && sort.column === col.key && (sort.ascending ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground w-20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {creating && (
                    <tr className="border-b border-border/20 bg-primary/[0.02]">
                      {columns.map((col, i) => (
                        <td key={i} className="px-4 py-2.5">
                          {col.key === "id" ? <span className="text-muted-foreground text-[10px]">Auto</span> :
                            <input type="text" value={newData[col.key as string] || ""} onChange={e => setNewData({ ...newData, [col.key]: e.target.value })}
                              className="w-full rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none" placeholder={col.header} />}
                        </td>
                      ))}
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <button onClick={handleCreate} disabled={saving} className="p-1 rounded-lg text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"><Save className="h-3 w-3" /></button>
                          <button onClick={() => setCreating(false)} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30"><X className="h-3 w-3" /></button>
                        </div>
                      </td>
                    </tr>
                  )}
                  {rows.map(row => (
                    <tr key={row.id} className={`border-b border-border/15 transition-colors ${editingId === row.id ? "bg-primary/[0.02]" : "hover:bg-muted/20"}`}
                      onClick={() => !editingId && onRowClick?.(row)}>
                      {columns.map((col, i) => (
                        <td key={i} className="px-4 py-3 text-foreground">
                          {editingId === row.id ? (
                            <input type="text" value={editData[col.key as string] ?? row[col.key as keyof T] ?? ""} onChange={e => setEditData({ ...editData, [col.key]: e.target.value })}
                              className="w-full rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none" />
                          ) : <div className="truncate max-w-[280px]">{val(row, col)}</div>}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          {editingId === row.id ? (
                            <>
                              <button onClick={() => handleUpdate(row.id as string)} disabled={saving} className="p-1 rounded-lg text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"><Save className="h-3 w-3" /></button>
                              <button onClick={() => { setEditingId(null); setEditData({}) }} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30"><X className="h-3 w-3" /></button>
                            </>
                          ) : (
                            <>
                              <button onClick={e => { e.stopPropagation(); setEditingId(row.id as string); setEditData({ ...row }) }} className="p-1 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-muted/30"><Edit className="h-3 w-3" /></button>
                              <button onClick={e => { e.stopPropagation(); setDeleteConfirm(row.id as string) }} className="p-1 rounded-lg text-muted-foreground/60 hover:text-red-400 hover:bg-red-500/10"><Trash2 className="h-3 w-3" /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && !creating && <tr><td colSpan={columns.length + 1} className="px-4 py-10 text-center text-muted-foreground text-xs">No records</td></tr>}
                </tbody>
              </table>
            </div>
            {Math.ceil(total / pageSize) > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
                <span className="text-[10px] text-muted-foreground">Page {page} of {Math.ceil(total / pageSize)}</span>
                <div className="flex gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"><ChevronDown className="h-3 w-3 rotate-90" /></button>
                  <button onClick={() => setPage(p => Math.min(Math.ceil(total / pageSize), p + 1))} disabled={page === Math.ceil(total / pageSize)} className="p-1 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"><ChevronDown className="h-3 w-3 -rotate-90" /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-80 rounded-xl border border-border/60 bg-card p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-foreground">Delete?</h3>
            <p className="mt-1 text-xs text-muted-foreground">This cannot be undone.</p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setDeleteConfirm(null)} className="rounded-lg border border-border/60 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
