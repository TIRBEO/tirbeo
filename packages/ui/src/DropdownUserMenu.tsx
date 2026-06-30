import type { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "./DropdownMenu";

export interface DropdownAction {
  label: string;
  icon: ReactNode;
  shortcut?: string;
  disabled?: boolean;
  variant?: "default" | "danger";
  action: () => void;
}

interface DropdownUserMenuProps {
  displayName: string;
  email: string;
  avatarUrl?: string;
  actions: DropdownAction[];
  align?: "start" | "end";
  trigger?: ReactNode;
}

export function DropdownUserMenu({
  displayName,
  email,
  actions,
  align = "start",
  trigger,
}: DropdownUserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface-hover hover:text-foreground transition-colors">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground/10 text-[10px] font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </span>
            <span className="truncate flex-1 text-left">{displayName}</span>
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-56">
        <div className="px-3 py-2">
          <div className="text-sm font-medium text-foreground truncate">{displayName}</div>
          {email && <div className="text-xs text-ink-soft truncate">{email}</div>}
        </div>
        {actions.length > 0 && (
          <>
            <DropdownMenuSeparator />
            {actions.map((item, i) => (
              <DropdownMenuItem
                key={i}
                onSelect={item.action}
                disabled={item.disabled}
                className={item.variant === "danger" ? "text-destructive hover:text-destructive hover:bg-destructive/10" : ""}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.shortcut && <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>}
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
