const isLocal = typeof window !== "undefined" && window.location.hostname === "localhost";

export const ACCOUNTS_URL = import.meta.env.VITE_ACCOUNTS_URL
  ?? (isLocal ? "http://localhost:5174" : "https://account.tirbeo.bishnuneupane13.com.np");

export const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL
  ?? (isLocal ? "http://localhost:5176" : "https://dashboard.tirbeo.bishnuneupane13.com.np");

const origin = typeof window !== "undefined" ? window.location.origin : "";

export function loginUrl() {
  return `${ACCOUNTS_URL}/login?redirect_to=${encodeURIComponent(`${origin}/auth/callback`)}`;
}

export function signupUrl() {
  return `${ACCOUNTS_URL}/signup?redirect_to=${encodeURIComponent(`${origin}/auth/callback`)}`;
}
