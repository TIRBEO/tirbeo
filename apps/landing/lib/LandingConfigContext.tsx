'use client';

import { createContext, useContext } from 'react';
import type { LandingConfig } from './config';

const LandingConfigContext = createContext<LandingConfig>({});

export function LandingConfigProvider({ config, children }: { config: LandingConfig; children: React.ReactNode }) {
  return <LandingConfigContext.Provider value={config}>{children}</LandingConfigContext.Provider>;
}

export function useLandingConfig() {
  return useContext(LandingConfigContext);
}
