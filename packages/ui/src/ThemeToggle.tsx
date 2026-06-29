import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "./useTheme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`flex items-center gap-1 rounded-lg border border-border bg-secondary/50 p-0.5 ${className}`}>
      {[
        { id: "dark" as const, icon: Moon, label: "Dark" },
        { id: "light" as const, icon: Sun, label: "Light" },
        { id: "system" as const, icon: Monitor, label: "System" },
      ].map((t) => {
        const Icon = t.icon;
        const isActive = theme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            title={t.label}
            className={`flex items-center justify-center rounded-md p-1.5 transition-colors ${
              isActive
                ? "bg-foreground/10 text-foreground"
                : "text-ink-soft hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
