"use client";

import { useState, useRef, useEffect } from "react";
import { appUrl } from "@/lib/domains";
import { useLandingConfig } from "./LandingContentProvider";

type DropdownItem = { label: string; description: string; link: string };

function MegaDropdown({ label, items }: { label: string; items: DropdownItem[] }) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setVisible(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
    requestAnimationFrame(() => setVisible(true));
  };

  const closeMenu = () => {
    closeTimer.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => setOpen(false), 200);
    }, 200);
  };

  return (
    <div ref={ref} className="relative" onMouseEnter={openMenu} onMouseLeave={closeMenu}>
      <button
        className={`flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-medium tracking-wide transition-all ${
          visible
            ? "text-white bg-white/[0.07]"
            : "text-white/55 hover:text-white hover:bg-white/[0.04]"
        }`}
      >
        {label}
        <svg className={`h-3 w-3 transition-transform duration-300 ${visible ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div className={`absolute left-1/2 top-full z-50 mt-3 -translate-x-1/2 transition-all duration-200 ${visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0 pointer-events-none"}`}>
          <div className={`relative overflow-hidden rounded-2xl border border-[#F25604]/10 bg-[#010006]/95 backdrop-blur-3xl shadow-2xl shadow-black/40 ${items.length >= 4 ? "w-[520px]" : "w-[300px]"}`}>
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <div className={`p-2.5 ${items.length >= 4 ? "grid grid-cols-2 gap-1" : "flex flex-col"}`}>
              {items.map((item) => (
                <a
                  key={item.label}
                  href={item.link}
                  className="group relative rounded-xl px-4 py-3.5 transition-all duration-200 hover:bg-gradient-to-r hover:from-white/[0.07] hover:to-white/[0.02] hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20"
                >
                  <span className="relative z-10 text-sm font-semibold tracking-tight text-white/85 transition-colors group-hover:text-white">{item.label}</span>
                  <span className="relative z-10 mt-1 block text-xs leading-relaxed text-white/35 transition-colors group-hover:text-white/60">{item.description}</span>
                  <div className="absolute inset-y-2 right-2 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const cfg = useLandingConfig().navbar;

  useEffect(() => {
    const about = document.getElementById("about");

    const handleScroll = () => {
      if (!about) return;
      const rect = about.getBoundingClientRect();
      setHidden(rect.top <= window.innerHeight * 0.3);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function MobileNavItem({ label, items }: { label: string; items: DropdownItem[] }) {
    const [expanded, setExpanded] = useState(false);

    return (
      <div className="border-b border-white/[0.04] last:border-0">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex w-full items-center justify-between px-3 py-2.5 text-xs font-medium text-white/70 transition-all duration-200 hover:text-white hover:bg-white/[0.04] rounded-lg md:px-6 md:py-4 md:text-sm"
            >
          {label}
          <svg
            className={`h-3 w-3 text-white/40 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-0.5 px-3 pb-2 md:px-6 md:pb-4">
            {items.map((item) => (
              <a
                key={item.label}
                href={item.link}
                onClick={() => setMobileOpen(false)}
                className="group block rounded-lg px-2.5 py-2 transition-all hover:bg-white/[0.04] md:rounded-xl md:px-4 md:py-3"
              >
                <span className="text-xs font-medium text-white/80 transition-colors group-hover:text-white md:text-sm">{item.label}</span>
                <span className="mt-0.5 hidden text-xs leading-relaxed text-white/30 md:block">{item.description}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-1.5 md:px-4 md:pt-5 transition-all duration-500 ${hidden ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="flex w-full max-w-md min-w-0 items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.03] px-2 py-2 md:max-w-6xl md:rounded-2xl md:px-6 md:py-3 backdrop-blur-2xl shadow-lg shadow-black/10">
        <a href="/" className="flex-shrink-0 min-w-0">
          <img src={cfg.logoUrl || "/logo1.png"} alt={cfg.siteName} className="h-6 w-auto max-w-[90px] object-contain md:h-10 md:max-w-[180px]" />
        </a>

        <nav className="hidden items-center md:flex md:gap-1">
          {cfg.dropdowns.map((d, i) => (
            <div key={d.label} className={i === 0 ? "ml-4" : ""}>
              <MegaDropdown label={d.label} items={d.items} />
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.04] px-2 py-2 text-white/60 md:hidden transition-all hover:bg-white/[0.08] hover:text-white"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
          <a
            href={appUrl("accounts", cfg.ctaUrl)}
            className="hidden md:inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 bg-gradient-to-r from-[#F25604] to-[#F97316] rounded-xl hover:from-[#F97316] hover:to-[#F25604] hover:shadow-lg hover:shadow-[#F25604]/30 hover:scale-105 active:scale-[0.98]"
          >
                 <span>{cfg.ctaText}</span>
            <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </div>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-x-4 top-14 z-50 max-h-[calc(100dvh-4rem)] overflow-hidden rounded-lg border border-[#F25604]/10 bg-[#010006]/95 backdrop-blur-3xl shadow-2xl shadow-black/50 md:hidden">
            <div className="max-h-[calc(100dvh-10rem)] overflow-y-auto overscroll-contain md:max-h-[calc(100vh-8rem)]">
              {cfg.dropdowns.map((d) => (
                <MobileNavItem key={d.label} label={d.label} items={d.items} />
              ))}
            </div>
            <div className="border-t border-white/[0.06] px-4 py-3 md:px-6 md:py-4">
              <a
                href={appUrl("accounts", cfg.ctaUrl)}
                onClick={() => setMobileOpen(false)}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#F25604] to-[#F97316] px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[#F25604]/25 transition-all hover:shadow-xl hover:shadow-[#F25604]/30 active:scale-[0.98] md:rounded-xl md:px-6 md:py-3 md:text-sm"
              >
                {cfg.ctaText}
                <svg className="h-3 w-3 md:h-3.5 md:w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
