"use client";

import "./ScrollStack.css";
import { type ReactNode } from "react";

export function ScrollStackItem({
  children,
  number,
}: {
  children: ReactNode;
  number?: string;
}) {
  return (
    <div className="scroll-stack-card">
      <div className="scroll-stack-card-inner">
        {number && (
          <span className="scroll-stack-badge">{number}</span>
        )}
        {children}
      </div>
    </div>
  );
}

export default function ScrollStack({ children }: { children: ReactNode }) {
  return (
    <div className="scroll-stack">
      <div className="scroll-stack-inner">
        {children}
        <div className="scroll-stack-end" />
      </div>
    </div>
  );
}