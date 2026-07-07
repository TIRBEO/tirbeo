"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const links = ["Features", "About", "Contact"];

export function Header() {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const header = ref.current;
    if (!header) return;
    let last = 0;
    ScrollTrigger.create({
      onUpdate: (self) => {
        const st = self.scroll();
        gsap.to(header, { y: st > last && st > 100 ? "-100%" : "0%", duration: 0.3 });
        last = st;
      },
    });
  }, []);

  return (
    <header ref={ref} className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-3">
      <div className="flex w-full max-w-6xl items-center justify-between rounded-2xl border border-white/[0.08] bg-[#010006]/80 px-5 py-2.5 backdrop-blur-2xl shadow-lg">
        <a href="/" className="text-lg font-bold tracking-tight text-white">Tirbeo</a>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`}
              className="rounded-xl px-4 py-2 text-sm font-medium text-white/50 transition-all hover:text-white hover:bg-white/[0.06]"
            >{l}</a>
          ))}
        </nav>

        <a href="https://accounts.tirbeo.app/login"
          className="hidden md:inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F25604] to-[#F97316] px-5 py-2 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#F25604]/20"
        >
          Get Started
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </a>

        <button onClick={() => setOpen(!open)}
          className="flex md:hidden items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.04] p-2 text-white/60"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="fixed inset-x-4 top-16 z-50 rounded-2xl border border-white/[0.08] bg-[#010006]/95 backdrop-blur-3xl p-4 md:hidden shadow-2xl">
          {links.map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 text-sm font-medium text-white/60 hover:bg-white/[0.06] hover:text-white"
            >{l}</a>
          ))}
          <hr className="my-3 border-white/[0.06]" />
          <a href="https://accounts.tirbeo.app/login" onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F25604] to-[#F97316] px-5 py-3 text-sm font-semibold text-white"
          >
            Get Started
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      )}
    </header>
  );
}
