export const isBrowser = typeof window !== "undefined";
export const isLocal = isBrowser && window.location.hostname === "localhost";

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const ACCOUNTS_URL = import.meta.env.VITE_ACCOUNTS_URL
  ?? (isLocal ? "http://localhost:5174" : "https://account.tirbeo.bishnuneupane13.com.np");

export const CHAT_URL = isLocal
  ? "http://localhost:5175"
  : "https://chat.tirbeo.bishnuneupane13.com.np";

export const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL
  ?? (isLocal ? "http://localhost:5176" : "https://dashboard.tirbeo.bishnuneupane13.com.np");
