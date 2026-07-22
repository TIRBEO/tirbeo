"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLandingConfig } from "./LandingContentProvider";

gsap.registerPlugin(ScrollTrigger);

const stages = [
  {
    body: "Tirbeo is built to make social networking feel personal again. We believe the best online experiences come from genuine conversations, shared interests, and communities where people feel welcome. Instead of endless scrolling, our platform encourages meaningful interactions that create real value and lasting connections.",
  },
  {
    body: "Every feature is designed with people in mind. Whether you're discovering local communities, meeting like-minded individuals, or sharing your ideas with the world, Tirbeo provides a clean, distraction-free space where authentic conversations can naturally grow.",
  },
  {
    body: "We prioritize privacy, performance, and simplicity. From secure messaging and modern technology to a fast, responsive experience across every device, Tirbeo is built to be reliable, intuitive, and respectful of your time and attention.",
  },
  {
    body: "Our mission is simple: create a platform where people connect because they genuinely want to—not because an algorithm tells them to. As Tirbeo grows, we remain committed to building a safer, more thoughtful, and more human social experience for everyone.",
  },
];

export function AboutSection() {
  const cfg = useLandingConfig().about;
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const titleRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);
  const blobARef = useRef<HTMLDivElement>(null);
  const blobBRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const panels = panelsRef.current.filter(Boolean) as HTMLDivElement[];
    const steps = stepsRef.current.filter(Boolean) as HTMLDivElement[];
    if (!section || !pin || !panels.length) return;

    const ctx = gsap.context(() => {
      gsap.to(blobARef.current, {
        x: 80, y: -60, duration: 16, ease: "sine.inOut", repeat: -1, yoyo: true,
      });
      gsap.to(blobBRef.current, {
        x: -60, y: 70, duration: 20, ease: "sine.inOut", repeat: -1, yoyo: true,
      });

      gsap.fromTo(titleRef.current,
        { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
        { opacity: 0, y: -80, scale: 0.85, filter: "blur(10px)", scrollTrigger: { trigger: section, start: "top top", end: "+=40%", scrub: 0.8 } },
      );

      gsap.set(panels, { opacity: 0, y: 100, scale: 0.9, filter: "blur(8px)", force3D: true });

      const total = panels.length;

      ScrollTrigger.create({
        trigger: pin,
        start: "top top",
        end: `+=${total * 110}%`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });

      const tl = gsap.timeline({ paused: true });

      panels.forEach((panel, i) => {
        const start = i / total;
        const mid = (i + 0.5) / total;
        const end = (i + 1) / total;

        tl.to(panel, {
          opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
          duration: mid - start, ease: "power3.out", force3D: true,
        }, start);

        tl.to(panel, {
          opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
          duration: end - mid - 0.05, ease: "none", force3D: true,
        }, mid);

        tl.to(panel, {
          opacity: 0, y: -80, scale: 0.88, filter: "blur(6px)",
          duration: 0.06, ease: "power2.in", force3D: true,
        }, end - 0.03);
      });

      ScrollTrigger.create({
        trigger: pin,
        start: "top top",
        end: `+=${total * 110}%`,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (st) => {
          const p = st.progress;
          tl.progress(p);

          if (progressRef.current) {
            gsap.set(progressRef.current, { scaleY: p });
          }

          if (counterRef.current) {
            const idx = Math.min(Math.floor(p * total), total - 1);
            counterRef.current.textContent = `${String(idx + 1).padStart(2, '0')}  /  ${String(total).padStart(2, '0')}`;
          }

          steps.forEach((step, i) => {
            const active = i <= Math.floor(p * total);
            gsap.set(step, {
              backgroundColor: active ? cfg.textColor : 'rgba(255,255,255,0.15)',
              scale: active ? 1.3 : 1,
            });
          });
        },
      });

      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, [cfg.textColor]);

  return (
    <section ref={sectionRef} id="about" className="relative overflow-hidden">
      {/* Background blobs */}
      <div ref={blobARef} className="pointer-events-none absolute left-[5%] top-[5%] h-[40rem] w-[40rem] rounded-full opacity-[0.07] blur-[150px]" style={{ background: "#F25604" }} />
      <div ref={blobBRef} className="pointer-events-none absolute bottom-[5%] right-[5%] h-[35rem] w-[35rem] rounded-full opacity-[0.05] blur-[150px]" style={{ background: "#7A3EF2" }} />

      {/* Grid overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Title screen */}
      <div className="relative min-h-screen flex items-center justify-center px-6" style={{ background: 'rgba(10,10,15,0.5)', backdropFilter: 'blur(4px)' }}>
        <div ref={titleRef} className="text-center max-w-4xl mx-auto">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.35em] text-white/25 mb-6">
            About
          </span>
          <h2 className="text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl lg:text-8xl"
            style={{ color: cfg.textColor, textShadow: `0 0 80px ${cfg.textColor}33` }}
          >
            {cfg.headline}
          </h2>
          {cfg.paragraphs[0] && (
            <p className="mt-5 text-sm leading-relaxed text-white/25 max-w-xl mx-auto md:text-base">
              {cfg.paragraphs[0]}
            </p>
          )}
          {/* Scroll cue */}
          <div className="mt-16 flex flex-col items-center gap-2 animate-pulse">
            <span className="block h-10 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/15">Scroll</span>
          </div>
        </div>
      </div>

      {/* Pinned paragraph scroll */}
      <div ref={pinRef} className="relative min-h-screen" style={{ background: 'rgba(10,10,15,0.4)', backdropFilter: 'blur(4px)' }}>
        <div className="mx-auto flex max-w-6xl items-center justify-center px-6 min-h-screen">
          {/* Left progress column */}
          <div className="hidden md:flex flex-col items-center gap-5 mr-16">
            <div className="relative h-48 w-[1px] bg-white/[0.08] overflow-hidden rounded-full">
              <div ref={progressRef} className="absolute bottom-0 left-0 w-full origin-bottom rounded-full transition-transform" style={{ backgroundColor: cfg.textColor, transform: 'scaleY(0)' }} />
            </div>
            <div className="flex flex-col gap-4">
              {stages.map((_, i) => (
                <div key={i} ref={(el) => { stepsRef.current[i] = el; }}
                  className="h-2 w-2 rounded-full transition-all duration-500" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
              ))}
            </div>
          </div>

          {/* Paragraph panels */}
          <div className="relative flex-1" style={{ perspective: 1200 }}>
            {stages.map((stage, i) => (
              <div key={`panel-${i}`} className="absolute inset-0 flex items-center justify-center">
                <div ref={(el) => { panelsRef.current[i] = el; }}
                  className="w-full max-w-3xl rounded-3xl border border-white/[0.06] p-8 md:p-12 lg:p-16"
                  style={{
                    background: 'rgba(18,20,23,0.6)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    willChange: 'transform, opacity, filter',
                    backfaceVisibility: 'hidden',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div className="flex items-center gap-3 mb-8">
                    <span className="block h-2 w-2 rounded-full" style={{ background: cfg.textColor, boxShadow: `0 0 16px ${cfg.textColor}66` }} />
                    <span className="block h-px flex-1" style={{ background: `linear-gradient(90deg, ${cfg.textColor}44, transparent)` }} />
                  </div>
                  <p className="text-xl leading-relaxed text-white/80 md:text-2xl md:leading-relaxed lg:text-3xl lg:leading-relaxed font-light">
                    {stage.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom counter */}
        <div ref={counterRef} className="absolute bottom-12 left-1/2 -translate-x-1/2 text-xs font-mono tracking-[0.2em] text-white/20">
          01  /  04
        </div>
      </div>
    </section>
  );
}
