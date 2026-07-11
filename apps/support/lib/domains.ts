const BASE_DOMAIN = "tirbeo.app";

export function appUrl(subdomain: string, path = "/"): string {
  const domain = subdomain === "www" || !subdomain ? BASE_DOMAIN : `${subdomain}.${BASE_DOMAIN}`;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `https://${domain}${cleanPath}`;
}
