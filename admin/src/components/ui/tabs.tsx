import * as React from "react"

interface TabsProps { defaultValue: string; children: React.ReactNode; className?: string }
interface TabsListProps { children: React.ReactNode; className?: string }
interface TabsTriggerProps { value: string; children: React.ReactNode; className?: string }
interface TabsContentProps { value: string; children: React.ReactNode; className?: string }

const TabsContext = React.createContext<{ value: string; onChange: (v: string) => void } | null>(null)

export function Tabs({ defaultValue, children, className }: TabsProps) {
  const [value, setValue] = React.useState(defaultValue)
  return <TabsContext.Provider value={{ value, onChange: setValue }}><div className={className}>{children}</div></TabsContext.Provider>
}

export function TabsList({ children, className }: TabsListProps) {
  return <div className={className} role="tablist">{children}</div>
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error("TabsTrigger must be used within Tabs")
  const { value: currentValue, onChange } = context
  return (
    <button role="tab" aria-selected={currentValue === value} onClick={() => onChange(value)}
      className={`px-3 py-1.5 text-xs font-medium transition-colors rounded-md ${
        currentValue === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground/70 hover:text-foreground"
      } ${className || ""}`}>
      {children}
    </button>
  )
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error("TabsContent must be used within Tabs")
  if (context.value !== value) return null
  return <div className={className} role="tabpanel">{children}</div>
}
