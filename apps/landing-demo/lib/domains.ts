export function appUrl(subdomain: string, path = "/"): string {
  const base = "tirbeo.app";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `https://${subdomain}.${base}${cleanPath}`;
}
