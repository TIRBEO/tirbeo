'use client';
import { useEffect, useState, createContext, useContext } from 'react';

interface ThemeColors {
  [key: string]: string;
}

interface ThemeBrand {
  name: string;
  tagline: string;
  logo: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  brand: ThemeBrand;
  loading: boolean;
}

const ThemeCtx = createContext<ThemeContextType>({ colors: {}, brand: { name: 'Tirbeo', tagline: '', logo: '' }, loading: true });

export function useThemeConfig() { return useContext(ThemeCtx); }

const DEFAULT_COLORS: ThemeColors = {
  '--bg': '#08150F',
  '--bg-surface': '#101c13',
  '--bg-card': '#12271D',
  '--bg-elevated': '#1a3326',
  '--text': '#F2EEE8',
  '--text-secondary': '#B7C6BE',
  '--text-muted': '#6b8a7a',
  '--accent': '#569578',
  '--accent-hover': '#6aab8d',
  '--accent-muted': '#275d46',
  '--success': '#59C173',
  '--warning': '#F4B942',
  '--danger': '#E45D5D',
  '--border': 'rgba(255,255,255,0.08)',
  '--border-hover': 'rgba(255,255,255,0.14)',
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colors, setColors] = useState<ThemeColors>(DEFAULT_COLORS);
  const [brand, setBrand] = useState<ThemeBrand>({ name: 'Tirbeo', tagline: '', logo: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.tirbeo.app';
    fetch(`${API}/api/public/theme`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.colors) setColors(data.colors);
        if (data?.brand) setBrand(data.brand);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    for (const [key, val] of Object.entries(colors)) {
      if (key.startsWith('--') && val) root.style.setProperty(key, val);
    }
  }, [colors]);

  return <ThemeCtx.Provider value={{ colors, brand, loading }}>{children}</ThemeCtx.Provider>;
}
