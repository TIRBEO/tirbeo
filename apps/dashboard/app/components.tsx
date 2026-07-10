'use client';
import { useEffect } from 'react';

export function ThemeInit() {
  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.tirbeo.app';
    // Read user preference from API
    fetch(`${API}/api/profile`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(user => {
        const pref = user?.theme || localStorage.getItem('tirbeo-theme') || 'dark';
        const resolved = pref === 'system'
          ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : pref;
        document.documentElement.setAttribute('data-theme', resolved);
      })
      .catch(() => {
        const saved = localStorage.getItem('tirbeo-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', saved);
      });
  }, []);
  return null;
}
