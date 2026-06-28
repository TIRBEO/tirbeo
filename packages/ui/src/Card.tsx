import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ hover, children, className, ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-border bg-card p-5 ${hover ? "transition-all hover:border-foreground/20 hover:shadow-lg" : ""} ${className ?? ""}`}
      {...props}
    >
      {children}
    </div>
  );
}
