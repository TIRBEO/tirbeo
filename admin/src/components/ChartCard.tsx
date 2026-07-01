interface ChartCardProps {
  title: string
  children: React.ReactNode
}

export default function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  )
}