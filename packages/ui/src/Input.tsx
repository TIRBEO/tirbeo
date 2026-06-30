import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-foreground/80">{label}</label>
        )}
        <input
          ref={ref}
          className={`w-full rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-sm text-foreground placeholder:text-ink-soft/50 outline-none transition-colors focus:border-foreground/30 focus:ring-1 focus:ring-foreground/20 ${error ? "border-destructive" : ""} ${className ?? ""}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
