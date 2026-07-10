"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { appUrl } from "@/lib/domains";
import { useLandingConfig } from "./LandingContentProvider";

export function Hero() {
  const cfg = useLandingConfig().hero;
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(titleRef.current,
        { opacity: 0, y: 80, filter: "blur(10px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2 },
      )
      .fromTo(subtitleRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.4",
      )
      .fromTo(buttonsRef.current?.children || [],
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, stagger: 0.15, duration: 0.6 },
        "-=0.3",
      )
      .fromTo(scrollRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5 },
        "-=0.2",
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Dark gradient overlay for readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/80 via-[#0a0a0f]/40 to-[#0a0a0f]/80" />

      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0" style={{ zIndex: 1, background: 'radial-gradient(ellipse at center, transparent 40%, #0a0a0f 100%)' }} />

      <div className="relative z-10 my-40 max-w-3xl text-center px-6">
        <h1
          ref={titleRef}
          className="font-heading text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-[#F8FAFC] md:text-6xl lg:text-7xl"
        >
          {cfg.headline1}
          <br />
          <span className="bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(to right, ${cfg.headline2Gradient.split(',').join(', ')})` }}>
            {cfg.headline2}
          </span>
        </h1>

        <p
          ref={subtitleRef}
          className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[#CBD5E1] md:text-xl"
        >
          {cfg.subtitle}
        </p>

        <div ref={buttonsRef} className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={appUrl("accounts", cfg.cta1Url)}
            aria-label={cfg.cta1Text}
            className="group relative inline-flex min-w-[220px] items-center justify-center overflow-hidden rounded-[16px] px-8 py-3.5 text-[15px] font-semibold text-white transition-all duration-300 hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F25604]/25"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#F25604] to-[#F97316]" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#F97316] to-[#F25604] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="absolute -inset-1 rounded-[16px] bg-gradient-to-br from-[#F25604]/40 to-[#F97316]/40 opacity-0 blur-xl transition-all duration-500 group-hover:opacity-100 group-hover:blur-2xl" />
            <span className="relative z-10 flex items-center gap-2">
              <span>{cfg.cta1Text}</span>
              <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </a>

          <a
            href={cfg.cta2Url || "#about"}
            aria-label={cfg.cta2Text}
            className="group relative inline-flex min-w-[220px] items-center justify-center overflow-hidden rounded-[16px] px-8 py-3 text-[15px] font-semibold text-[#94A3B8] backdrop-blur-[18px] transition-all duration-300 hover:scale-105 hover:text-[#F8FAFC] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
          >
            <div className="absolute inset-0 rounded-[16px] border border-white/[0.12] bg-white/[0.08]" />
            <span className="relative z-10 flex items-center gap-2">
              <span>{cfg.cta2Text}</span>
              <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m9 5.25 6 6-6 6" />
              </svg>
            </span>
          </a>
        </div>

        <div ref={scrollRef} className="mt-40 flex flex-col items-center gap-2">
          <div className="flex h-8 w-5 rounded-full border-2 border-white/20 items-start justify-center pt-1.5">
            <div className="h-1.5 w-1 rounded-full bg-white/40 animate-scroll-dot" />
          </div>
          <span className="text-xs text-white/30">{cfg.scrollText}</span>
        </div>
      </div>
    </section>
  );
}
