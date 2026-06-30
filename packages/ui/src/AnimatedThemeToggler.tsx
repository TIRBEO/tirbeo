"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./useTheme";

export function AnimatedThemeToggler({ className = "" }: { className?: string }) {
  const { resolvedTheme, toggle } = useTheme();
  const [animating, setAnimating] = useState(false);

  const handleClick = () => {
    setAnimating(true);
    toggle();
  };

  useEffect(() => {
    if (animating) {
      const timer = setTimeout(() => setAnimating(false), 400);
      return () => clearTimeout(timer);
    }
  }, [animating]);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={handleClick}
      className={`relative flex h-9 w-9 items-center justify-center rounded-full bg-secondary/50 transition-colors hover:bg-secondary ${className}`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <div
        className="flex items-center justify-center transition-all duration-500"
        style={{
          transform: animating
            ? `rotate(${isDark ? -180 : 180}deg) scale(0)`
            : "rotate(0deg) scale(1)",
        }}
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-foreground" />
        ) : (
          <Sun className="h-4 w-4 text-foreground" />
        )}
      </div>
      <div
        className="absolute inset-0 flex items-center justify-center transition-all duration-500"
        style={{
          transform: animating
            ? `rotate(${isDark ? 0 : 0}deg) scale(1)`
            : `rotate(${isDark ? 180 : -180}deg) scale(0)`,
          opacity: animating ? 1 : 0,
        }}
      >
        {isDark ? (
          <Sun className="h-4 w-4 text-foreground" />
        ) : (
          <Moon className="h-4 w-4 text-foreground" />
        )}
      </div>
    </button>
  );
}
