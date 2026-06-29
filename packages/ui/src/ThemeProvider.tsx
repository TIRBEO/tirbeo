import { useState, useEffect, useCallback, type ReactNode } from "react";
import { ThemeContext, type Theme } from "./useTheme";

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(theme: Theme): "dark" | "light" {
  if (theme === "system") return getSystemTheme();
  return theme;
}

function applyTheme(resolved: "dark" | "light") {
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

const STORAGE_KEY = "tirbeo-theme";

function loadSavedTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light" || saved === "system") return saved;
  } catch {}
  return "dark";
}

function saveTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {}
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(loadSavedTheme);
  const [resolvedTheme, setResolved] = useState<"dark" | "light">(() => resolveTheme(loadSavedTheme()));

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    saveTheme(t);
    const resolved = resolveTheme(t);
    setResolved(resolved);
    applyTheme(resolved);
  }, []);

  const toggle = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, []);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const r = getSystemTheme();
      setResolved(r);
      applyTheme(r);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  return (
    <ThemeContext value={{ theme, resolvedTheme, setTheme, toggle }}>
      {children}
    </ThemeContext>
  );
}
