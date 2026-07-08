"use client";

import { useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { appUrl } from "@/lib/domains";
import { useSiteConfig } from "./SiteConfigProvider";
import { ParticleField3D } from "./ParticleField3D";

export function Hero() {
  const config = useSiteConfig();
  const { hero } = config;

  const sectionRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const gradientParts = hero.headline2Gradient.split(",");

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(titleRef.current,
        { opacity: 0, y: 120, scale: 0.92, filter: "blur(12px)" },
        { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 1.4 },
      )
      .fromTo(subtitleRef.current,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1 },
        "-=0.6",
      )
      .fromTo(buttonsRef.current?.children || [],
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, stagger: 0.2, duration: 0.8 },
        "-=0.4",
      )
      .fromTo(scrollRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.2",
      );

      gsap.to(".hero-orb", {
        x: "random(-30, 30)",
        y: "random(-20, 20)",
        scale: "random(0.85, 1.15)",
        duration: "random(10, 16)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: { each: 0.4, from: "random" },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!bgRef.current || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    bgRef.current.style.transform = `translate(${x * -20}px, ${y * -20}px) scale(1.08)`;
  }, []);

  const onMouseLeave = useCallback(() => {
    if (!bgRef.current) return;
    bgRef.current.style.transform = "translate(0, 0) scale(1.05)";
  }, []);

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6"
    >
      <div
        ref={bgRef}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-700 ease-out will-change-transform"
        style={{ backgroundImage: `url(${hero.bgImage})` }}
        role="img"
        aria-label="Hero background"
      />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="hero-orb absolute left-[10%] top-[20%] h-72 w-72 rounded-full bg-gradient-to-br from-[#F25604]/8 to-transparent blur-3xl" />
        <div className="hero-orb absolute right-[15%] top-[15%] h-96 w-96 rounded-full bg-gradient-to-br from-[#7A3EF2]/6 to-transparent blur-3xl" />
        <div className="hero-orb absolute bottom-[25%] left-[40%] h-80 w-80 rounded-full bg-gradient-to-br from-[#2F4FC4]/6 to-transparent blur-3xl" />
      </div>
      <ParticleField3D />

      <div className="relative z-10 my-60 max-w-3xl text-center">
        <h1
          ref={titleRef}
          className="font-heading text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-[#F8FAFC] md:text-6xl lg:text-7xl"
        >
          {hero.headline1}
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(to right, ${gradientParts.join(",")})` }}
          >
            {hero.headline2}
          </span>
        </h1>

        <p
          ref={subtitleRef}
          className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[#CBD5E1] md:text-xl"
        >
          {hero.subtitle}
        </p>

        <div ref={buttonsRef} className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={appUrl("accounts", hero.cta1Url)}
            aria-label="Join"
            className="group relative inline-flex min-w-[220px] items-center justify-center overflow-hidden rounded-[16px] px-8 py-3.5 text-[15px] font-semibold text-white transition-all duration-300 hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F25604]/25"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#F25604] to-[#F97316]" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#F97316] to-[#F25604] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="absolute -inset-1 rounded-[16px] bg-gradient-to-br from-[#F25604]/40 to-[#F97316]/40 opacity-0 blur-xl transition-all duration-500 group-hover:opacity-100 group-hover:blur-2xl" />
            <span className="relative z-10 flex items-center gap-2">
              <span>{hero.cta1Text}</span>
              <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </a>

          <a
            href={hero.cta2Url}
            aria-label="Explore"
            className="group relative inline-flex min-w-[220px] items-center justify-center overflow-hidden rounded-[16px] px-8 py-3 text-[15px] font-semibold text-[#94A3B8] backdrop-blur-[18px] transition-all duration-300 hover:scale-105 hover:text-[#F8FAFC] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
          >
            <div className="absolute inset-0 rounded-[16px] border border-white/[0.12] bg-white/[0.08]" />
            <span className="relative z-10 flex items-center gap-2">
              <span>{hero.cta2Text}</span>
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
          <span className="text-xs text-white/30">{hero.scrollText}</span>
        </div>
      </div>
    </section>
  );
}
