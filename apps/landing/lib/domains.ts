type Subdomain = "www" | "accounts" | "dashboard" | "chat" | "admin" | "support" | "api" | "docs" | "help" | "chats";

const SUBDOMAIN_MAP: Record<Subdomain, string> = {
  www: "",
  accounts: "accounts",
  dashboard: "dashboard",
  chat: "chat",
  admin: "admin",
  support: "support",
  api: "api",
  docs: process.env.NEXT_PUBLIC_DOCS_DOMAIN || "docs.tirbeo.app",
  help: process.env.NEXT_PUBLIC_HELP_DOMAIN || "help.tirbeo.app",
  chats: process.env.NEXT_PUBLIC_CHATS_DOMAIN || "chats.tirbeo.app",
};

function getBaseDomain(): string {
  return process.env.NEXT_PUBLIC_APP_DOMAIN || process.env.NEXT_PUBLIC_SITE_DOMAIN || "tirbeo.app";
}

export function appUrl(subdomain: Subdomain, path = "/"): string {
  const base = getBaseDomain();
  const prefix = SUBDOMAIN_MAP[subdomain];
  const domain = subdomain === "www" ? base : prefix.includes(".") ? prefix : `${prefix}.${base}`;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `https://${domain}${cleanPath}`;
}
