'use client';
import { useEffect, useState, createContext, useContext } from 'react';

interface ThemeColors { [key: string]: string; }
interface ThemeBrand { name: string; tagline: string; logo: string; }
interface ThemeContextType { colors: ThemeColors; brand: ThemeBrand; loading: boolean; }

const ThemeCtx = createContext<ThemeContextType>({ colors: {}, brand: { name: 'Tirbeo', tagline: '', logo: '' }, loading: true });
export function useThemeConfig() { return useContext(ThemeCtx); }

const DEFAULT_COLORS: ThemeColors = {
  '--bg': '#000000', '--bg-surface': 'rgba(255,255,255,0.03)', '--bg-card': 'rgba(255,255,255,0.04)', '--bg-elevated': 'rgba(255,255,255,0.06)',
  '--text': '#ffffff', '--text-secondary': 'rgba(255,255,255,0.55)', '--text-muted': 'rgba(255,255,255,0.3)',
  '--accent': '#ffffff', '--accent-hover': 'rgba(255,255,255,0.85)', '--accent-muted': 'rgba(255,255,255,0.08)',
  '--success': 'rgba(255,255,255,0.8)', '--warning': 'rgba(255,255,255,0.6)', '--danger': 'rgba(255,255,255,0.5)',
  '--border': 'rgba(255,255,255,0.08)', '--border-hover': 'rgba(255,255,255,0.15)',
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colors, setColors] = useState<ThemeColors>(DEFAULT_COLORS);
  const [brand, setBrand] = useState<ThemeBrand>({ name: 'Tirbeo', tagline: '', logo: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    setLoading(false);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    for (const [key, val] of Object.entries(colors)) {
      if (key.startsWith('--') && val) root.style.setProperty(key, val);
    }
  }, [colors]);

  return <ThemeCtx.Provider value={{ colors, brand, loading }}>{children}</ThemeCtx.Provider>;
}
