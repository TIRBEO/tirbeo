import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { Loader2, CheckCircle2, XCircle, Eye, Clock } from "lucide-react"

interface Item { id: string; content_type: string; title: string; subject: string; content_id: string; submitted_by: string; submitted_by_email?: string; status: string; created_at: string; updated_at: string; reviewed_by: string | null; review_notes: string | null }

type Tab = "pending" | "approved" | "rejected"

const tabs: { k: Tab; l: string; i: typeof Clock }[] = [
  { k: "pending", l: "Pending", i: Clock }, { k: "approved", l: "Approved", i: CheckCircle2 }, { k: "rejected", l: "Rejected", i: XCircle },
]

const statusColors: Record<string, string> = {
  pending: "text-amber-400 bg-amber-500/10", approved: "text-emerald-400 bg-emerald-500/10", rejected: "text-red-400 bg-red-500/10",
}

export default function ContentApprovalPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>("pending")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => { fetchApprovals() }, [])

  async function fetchApprovals() {
    setLoading(true)
    const { data, error } = await supabase.from("content_approvals").select("*").order("created_at", { ascending: false })
    if (!error && data) {
      const enriched = await Promise.all(data.map(async (item) => {
        if (item.submitted_by) {
          const { data: p } = await supabase.from("user_profiles").select("email").eq("user_id", item.submitted_by).single()
          return { ...item, submitted_by_email: p?.email || "unknown" }
        }
        return { ...item, submitted_by_email: "unknown" }
      }))
      setItems(enriched)
    }
    setLoading(false)
  }

  async function handleAction(id: string, status: "approved" | "rejected") {
    setActionLoading(id)
    const user = (await supabase.auth.getUser()).data.user
    await supabase.from("content_approvals").update({ status, reviewed_by: user?.id || null, updated_at: new Date().toISOString() }).eq("id", id)
    fetchApprovals()
    setActionLoading(null)
  }

  const filtered = items.filter(i => i.status === activeTab)

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>

  return (
    <div className="max-w-6xl space-y-5">
      <div>
        <h1 className="text-sm font-semibold text-foreground">Approvals</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{items.filter(i => i.status === "pending").length} pending</p>
      </div>

      <div className="flex gap-1 rounded-lg bg-muted/30 p-1 w-fit">
        {tabs.map(({ k, l, i: I }) => {
          const count = items.filter(x => x.status === k).length
          return (
            <button key={k} onClick={() => setActiveTab(k)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === k ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              <I className="h-3 w-3" /> {l}
              <span className={`text-[10px] px-1 py-0.5 rounded ${activeTab === k ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"}`}>{count}</span>
            </button>
          )
        })}
      </div>

      <div className="space-y-2">
        {filtered.map(item => (
          <div key={item.id} className="bg-card border border-border/50 rounded-xl p-4 hover:border-border/70 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded uppercase">{item.content_type}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusColors[item.status] || "bg-muted text-muted-foreground"}`}>{item.status}</span>
                </div>
                <p className="text-xs font-medium text-foreground">{item.title || item.subject}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                  <span>By: {item.submitted_by_email}</span>
                  <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                {item.review_notes && <p className="text-[10px] text-muted-foreground mt-1 italic">{item.review_notes}</p>}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {item.status === "pending" && (
                  <>
                    <button onClick={() => handleAction(item.id, "approved")} disabled={actionLoading === item.id}
                      className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-medium text-primary-foreground hover:bg-emerald-500 disabled:opacity-50 transition-colors">
                      {actionLoading === item.id ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <CheckCircle2 className="h-2.5 w-2.5" />} Approve
                    </button>
                    <button onClick={() => handleAction(item.id, "rejected")} disabled={actionLoading === item.id}
                      className="flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1 text-[10px] font-medium text-primary-foreground hover:bg-red-500 disabled:opacity-50 transition-colors">
                      <XCircle className="h-2.5 w-2.5" /> Reject
                    </button>
                  </>
                )}
                <button className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"><Eye className="h-3 w-3" /></button>
              </div>
            </div>
          </div>
        ))}
        {!filtered.length && <p className="text-center py-10 text-xs text-muted-foreground">No {activeTab} items</p>}
      </div>
    </div>
  )
}
