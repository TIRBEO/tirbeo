/**
 * @tirbeo/design-system - Main entry point
 * Import the CSS styles in your app
 */

export { } from './styles.css';

// Type definitions for design tokens
export type ColorToken = 
  | 'bg-canvas' | 'bg-surface' | 'bg-elevated' | 'bg-card' | 'bg-hover' | 'bg-input'
  | 'text-primary' | 'text-secondary' | 'text-muted' | 'text-inverse'
  | 'gold' | 'gold-light' | 'gold-dark' | 'moss' | 'moss-light' | 'moss-dark'
  | 'olive' | 'cream' | 'rose'
  | 'border-default' | 'border-subtle' | 'border-focus'
  | 'success' | 'warning' | 'danger' | 'info';

export type SpacingToken = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
export type RadiusToken = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type ShadowToken = 'sm' | 'md' | 'lg' | 'xl' | 'gold' | 'gold-lg' | 'moss';

export interface DesignTokens {
  colors: Record<ColorToken, string>;
  spacing: Record<SpacingToken, string>;
  radius: Record<RadiusToken, string>;
  shadows: Record<ShadowToken, string>;
  transitions: {
    fast: string;
    base: string;
    slow: string;
    spring: string;
  };
  zIndex: {
    dropdown: number;
    modal: number;
    modalBackdrop: number;
    toast: number;
  };
}

declare global {
  interface Window {
    __TIRBEO_DESIGN_TOKENS__: DesignTokens;
  }
}