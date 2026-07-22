'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { LandingConfig, fetchLandingConfig } from '@/lib/config';

const LandingContext = createContext<LandingConfig | null>(null);

export function LandingContentProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<LandingConfig | null>(null);

  useEffect(() => {
    fetchLandingConfig().then(setConfig);
  }, []);

  if (!config) {
    return (
      <div className="landing-skeleton">
        <div className="skeleton-hero" />
        <div className="skeleton-section" />
        <div className="skeleton-footer" />
      </div>
    );
  }

  return <LandingContext.Provider value={config}>{children}</LandingContext.Provider>;
}

export function useLandingConfig() {
  const ctx = useContext(LandingContext);
  if (!ctx) throw new Error('useLandingConfig must be used within LandingContentProvider');
  return ctx;
}
