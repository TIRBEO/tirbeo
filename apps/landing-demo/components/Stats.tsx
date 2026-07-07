"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: 50, suffix: "K+", label: "Active Users" },
  { value: 10, suffix: "M+", label: "Messages" },
  { value: 500, suffix: "+", label: "Communities" },
  { value: 99.9, suffix: "%", label: "Uptime" },
];

export function Stats() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(el.querySelectorAll(".stat-item"),
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        },
      );

      el.querySelectorAll<HTMLElement>(".stat-number").forEach((n) => {
        const target = parseInt(n.dataset.target || "0");
        const suffix = n.dataset.suffix || "";
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target, duration: 2, ease: "power3.out",
          scrollTrigger: { trigger: n, start: "top 85%", once: true },
          onUpdate: () => { n.textContent = Math.floor(obj.v) + suffix; },
          onComplete: () => { n.textContent = target + suffix; },
        });
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="py-20 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="stat-item text-center">
              <div className="stat-number text-4xl font-bold text-[#F25604] md:text-5xl"
                data-target={s.value} data-suffix={s.suffix}
              >0{s.suffix}</div>
              <div className="mt-1.5 text-sm text-white/30">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
