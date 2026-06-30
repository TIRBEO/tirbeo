import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variants = {
  primary: "bg-accent text-white hover:bg-accent-hover disabled:opacity-50",
  secondary: "bg-secondary text-foreground hover:bg-foreground/10",
  outline: "border border-border text-ink-soft hover:text-foreground hover:bg-secondary",
  ghost: "text-ink-soft hover:text-foreground hover:bg-secondary",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, children, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all active:scale-[0.98] ${variants[variant]} ${sizes[size]} ${className ?? ""}`}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
