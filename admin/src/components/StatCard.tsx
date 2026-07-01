interface StatCardProps {
  title: string
  value: string | number
  change?: string
  trend?: "up" | "down"
  icon?: React.ComponentType<{ className?: string }>
}

export default function StatCard({ title, value, change, trend, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border/40 bg-card p-5 transition-all duration-300 hover:border-border/80">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold text-foreground tabular-nums">{typeof value === "number" ? value.toLocaleString() : value}</p>
        </div>
        {Icon && (
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
      </div>
      {change && (
        <div className="mt-3 flex items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trend === "up" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
            {change}
          </span>
          <span className="text-xs text-muted-foreground">vs last month</span>
        </div>
      )}
    </div>
  )
}
