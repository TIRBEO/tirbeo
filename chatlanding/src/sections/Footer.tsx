import { useEffect, useState } from "react";
import { getSiteConfig, getFooterTree, getNavLinks, type SiteConfig, type FooterSection, type NavLink } from "@/lib/content";

export function Footer() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);

  useEffect(() => {
    getSiteConfig().then(setConfig);
    getFooterTree().then(setSections);
    getNavLinks().then(setNavLinks);
  }, []);

  const siteName = config?.site_name || "tirbeo";
  const tagline = config?.tagline || "Connect. Create. Collaborate. A modern workspace for the communities you care about.";

  return (
    <footer className="border-t border-border bg-muted/40 px-6 py-14">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary">
              <img src="/logo.png" alt="" className="h-6 w-6 object-contain brightness-0 invert" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">{siteName}</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-ink-soft">{tagline}</p>
        </div>
        {sections.map((s) => (
          <div key={s.id}>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">{s.title}</h4>
            <ul className="mt-4 space-y-2 text-sm">
              {s.links.map((link) => (
                <li key={link.id}>
                  <a href={link.href} className="hover:text-[var(--clay)]">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {navLinks.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">Navigation</h4>
            <ul className="mt-4 space-y-2 text-sm">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <a href={link.href} className="hover:text-[var(--clay)]">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-ink-soft sm:flex-row sm:items-center">
        <span>&copy; 2026 {siteName}. All rights reserved.</span>
        <span className="font-mono">{config?.seo_title || siteName}</span>
      </div>
    </footer>
  );
}
