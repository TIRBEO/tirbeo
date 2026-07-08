'use client';
import { useRef, useEffect, useState } from 'react';
import { useSiteConfig } from './SiteConfigProvider';

function FeatureCard({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="shrink-0 w-[340px] md:w-[400px] rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm hover:bg-white/[0.06] transition-all duration-500">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-2 w-2 rounded-full bg-gradient-to-br from-[#F25604] to-[#F97316]" />
        <span className="text-sm font-semibold text-white/90">{label}</span>
      </div>
      <p className="text-sm text-[#94A3B8] leading-relaxed">{desc}</p>
    </div>
  );
}

export function ScrollMarquee() {
  const config = useSiteConfig();
  const { features } = config;

  const sectionRef = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const top = rect.top;
      const h = window.innerHeight;
      const scrollProgress = (-top + h) * 0.3;
      setOffset(scrollProgress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const row1Style = { transform: `translateX(${offset - 200}px)`, willChange: 'transform' as const };
  const row2Style = { transform: `translateX(${-(offset - 200)}px)`, willChange: 'transform' as const };

  const mid = Math.ceil(features.items.length / 2);
  const row1Items = features.items.slice(0, mid);
  const row2Items = features.items.slice(mid);

  const tripled1 = [...row1Items, ...row1Items, ...row1Items];
  const tripled2 = [...row2Items, ...row2Items, ...row2Items];

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-[#010006] py-24 sm:py-32 md:py-40 pb-10">
      <div className="text-center mb-16 px-6">
        <span className="inline-block text-xs font-mono tracking-[0.2em] text-[#F25604]/60 uppercase mb-4">
          Features
        </span>
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-semibold text-[#F8FAFC]">
          {features.headline.split(" ").slice(0, -1).join(" ")}{" "}
          <span className="bg-gradient-to-r from-[#F97316] to-[#F25604] bg-clip-text text-transparent">
            {features.headline.split(" ").pop()}
          </span>
        </h2>
        <p className="mt-4 text-[#94A3B8] max-w-xl mx-auto">
          {features.subtitle}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-4" style={row1Style}>
          {tripled1.map((item, i) => (
            <FeatureCard key={`r1-${i}`} label={item.label} desc={item.desc} />
          ))}
        </div>
        <div className="flex gap-4" style={row2Style}>
          {tripled2.map((item, i) => (
            <FeatureCard key={`r2-${i}`} label={item.label} desc={item.desc} />
          ))}
        </div>
      </div>
    </section>
  );
}
