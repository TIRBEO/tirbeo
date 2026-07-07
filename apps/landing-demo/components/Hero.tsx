"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { HeroScene } from "./HeroScene";

export function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const btnsRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(titleRef.current,
        { opacity: 0, y: 80, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2 },
      )
      .fromTo(descRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.5",
      )
      .fromTo(btnsRef.current?.children || [],
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, stagger: 0.15, duration: 0.6 },
        "-=0.3",
      )
      .fromTo(scrollRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5 },
        "-=0.1",
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#010006] via-[#02010e] to-[#010006]" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[#F25604]/5 blur-[150px]" />
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-[#F97316]/3 blur-[120px]" />

      <HeroScene />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center pt-24 pb-32">
        <h1 ref={titleRef} className="font-heading text-4xl font-bold leading-[1.1] tracking-tight text-white md:text-6xl lg:text-7xl">
          One platform.
          <br />
          <span className="bg-gradient-to-r from-[#F97316] to-[#F25604] bg-clip-text text-transparent">
            Infinite possibilities.
          </span>
        </h1>

        <p ref={descRef} className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/40 md:text-lg">
          Connect with people who inspire you, share what matters, and become part of communities
          that make the internet feel personal again.
        </p>

        <div ref={btnsRef} className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="https://accounts.tirbeo.app/login"
            className="group relative inline-flex min-w-[200px] items-center justify-center overflow-hidden rounded-2xl px-7 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#F25604] to-[#F97316]" />
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#F25604]/30 to-[#F97316]/30 opacity-0 blur-lg transition-all duration-500 group-hover:opacity-100" />
            <span className="relative z-10 flex items-center gap-2">
              Join the platform
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </a>

          <a href="#features"
            className="inline-flex min-w-[200px] items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.04] px-7 py-3 text-sm font-semibold text-white/50 backdrop-blur-lg transition-all hover:text-white hover:bg-white/[0.08]"
          >
            <span className="flex items-center gap-2">
              Explore
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m9 5.25 6 6-6 6" />
              </svg>
            </span>
          </a>
        </div>

        <div ref={scrollRef} className="mt-32 flex flex-col items-center gap-2">
          <div className="flex h-8 w-5 rounded-full border-2 border-white/10 items-start justify-center pt-1.5">
            <div className="h-1.5 w-1 rounded-full bg-white/20 animate-scroll-dot" />
          </div>
          <span className="text-xs text-white/15">Scroll</span>
        </div>
      </div>
    </section>
  );
}
