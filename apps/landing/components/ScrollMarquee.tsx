'use client';
import { useRef, useEffect, useState } from 'react';

const FEATURES_ROW1 = [
  { label: 'Real-time Chat', desc: 'Instant messaging with end-to-end encryption' },
  { label: 'Community Spaces', desc: 'Create and join topic-based communities' },
  { label: 'Voice Channels', desc: 'Crystal-clear voice conversations' },
  { label: 'Media Sharing', desc: 'Share photos, videos, and files securely' },
  { label: 'Smart Notifications', desc: 'Stay informed without the noise' },
  { label: 'Profile Customization', desc: 'Express yourself with custom profiles' },
  { label: 'Group Chats', desc: 'Connect with multiple people at once' },
  { label: 'Private Messaging', desc: 'One-on-one conversations that matter' },
  { label: 'Event Planning', desc: 'Organize meetups and virtual events' },
  { label: 'Content Discovery', desc: 'Find content tailored to your interests' },
  { label: 'Real-time Chat', desc: 'Instant messaging with end-to-end encryption' },
];

const FEATURES_ROW2 = [
  { label: 'End-to-End Encryption', desc: 'Your conversations stay private, always' },
  { label: 'Zero Data Tracking', desc: 'We never sell or share your data' },
  { label: 'Open Source', desc: 'Transparent code, auditable by anyone' },
  { label: 'No Algorithmic Feed', desc: 'You control what you see' },
  { label: 'Ad-Free Experience', desc: 'No ads, no distractions, no tracking' },
  { label: 'Data Portability', desc: 'Take your data anywhere, anytime' },
  { label: 'Local Communities', desc: 'Connect with people near you' },
  { label: 'Global Reach', desc: 'Find friends across borders' },
  { label: 'Privacy First', desc: 'Built with privacy as a foundation' },
  { label: 'User Controlled', desc: 'Full control over your experience' },
  { label: 'End-to-End Encryption', desc: 'Your conversations stay private, always' },
];

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

  const tripled1 = [...FEATURES_ROW1, ...FEATURES_ROW1, ...FEATURES_ROW1];
  const tripled2 = [...FEATURES_ROW2, ...FEATURES_ROW2, ...FEATURES_ROW2];

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-[#010006] py-24 sm:py-32 md:py-40 pb-10">
      <div className="text-center mb-16 px-6">
        <span className="inline-block text-xs font-mono tracking-[0.2em] text-[#F25604]/60 uppercase mb-4">
          Features
        </span>
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-semibold text-[#F8FAFC]">
          Built with{" "}
          <span className="bg-gradient-to-r from-[#F97316] to-[#F25604] bg-clip-text text-transparent">
            purpose
          </span>
        </h2>
        <p className="mt-4 text-[#94A3B8] max-w-xl mx-auto">
          Every feature is designed to foster genuine connection — not to keep you hooked.
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
