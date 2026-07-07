"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    title: "Real-time Chat",
    desc: "Instant messaging with channels, threads, and voice. Everything syncs in real-time.",
  },
  {
    title: "Communities",
    desc: "Create or join communities around shared interests, locations, and passions.",
  },
  {
    title: "Privacy",
    desc: "End-to-end encryption and full control over your data. No tracking, no selling.",
  },
  {
    title: "Lightning Fast",
    desc: "Built on modern infra for sub-second load times. Real-time sync everywhere.",
  },
  {
    title: "Customizable",
    desc: "Themes, servers, bots, and deep integration options to make it your own.",
  },
  {
    title: "Global",
    desc: "Multi-language support with distributed infrastructure worldwide.",
  },
];

export function Features() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(el.querySelectorAll(".feature-card"),
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, stagger: 0.08, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 80%", once: true },
        },
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} id="features" className="py-28 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-14">
          <span className="reveal text-xs font-semibold uppercase tracking-[0.2em] text-[#F97316]">Features</span>
          <h2 className="reveal mt-3 text-3xl font-bold text-white md:text-4xl">Built for connection</h2>
          <p className="reveal mt-3 max-w-md mx-auto text-white/30">Everything you need to build and grow communities.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title}
              className="feature-card rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.05]"
            >
              <div className="mb-3 h-1.5 w-8 rounded-full bg-gradient-to-r from-[#F25604] to-[#F97316]" />
              <h3 className="text-base font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/35">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
