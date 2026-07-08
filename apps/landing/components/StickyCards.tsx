'use client';
import { useRef } from 'react';
import { useScroll, useTransform, motion } from 'motion/react';

const features = [
  {
    num: '01',
    label: 'Connect',
    name: 'Real-time Conversation',
    description: 'Instant messaging with end-to-end encryption. Every message is private, every conversation is yours. No tracking, no data mining, no compromises.',
    color: '#F25604',
  },
  {
    num: '02',
    label: 'Discover',
    name: 'Communities & Spaces',
    description: 'Find your people in topic-based communities. From local neighborhoods to global interests, discover spaces that feel like home.',
    color: '#F97316',
  },
  {
    num: '03',
    label: 'Create',
    name: 'Share & Collaborate',
    description: 'Share ideas, media, and moments that matter. Collaborate in real-time with tools designed for genuine interaction, not engagement metrics.',
    color: '#7A3EF2',
  },
];

function FeatureCard({ feature, index, total }: { feature: typeof features[0]; index: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'start start'],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1 - (total - 1 - index) * 0.04, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [0.6, 1, 1]);

  return (
    <div ref={ref} className="sticky" style={{ top: `${100 + index * 28}px`, height: '85vh' }}>
      <motion.div
        className="w-full h-full rounded-[40px] sm:rounded-[50px] md:rounded-[60px] border border-white/[0.08] bg-gradient-to-b from-[#0A0A14] to-[#010006] p-6 sm:p-8 md:p-10 flex flex-col overflow-hidden"
        style={{ scale, opacity, transformOrigin: 'top center' }}
      >
        <div className="flex items-start justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-4 sm:gap-6">
            <span className="font-black text-[clamp(2rem,8vw,100px)] text-white/5 leading-none">{feature.num}</span>
            <div>
              <span className="text-[10px] sm:text-xs font-medium uppercase tracking-widest" style={{ color: feature.color }}>
                {feature.label}
              </span>
              <h3 className="text-xl sm:text-3xl md:text-4xl font-semibold text-white mt-1">{feature.name}</h3>
            </div>
          </div>
          <div
            className="shrink-0 h-12 w-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${feature.color}15` }}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={feature.color}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </div>
        </div>

        <div className="flex-1 flex items-center">
          <div className="max-w-2xl">
            <div className="h-1.5 w-16 rounded-full mb-6" style={{ backgroundColor: feature.color }} />
            <p className="text-base sm:text-lg md:text-xl leading-relaxed text-[#CBD5E1]">
              {feature.description}
            </p>
            <div className="mt-8 flex gap-3">
              {['Private', 'Secure', 'Free'].map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1.5 rounded-full border border-white/[0.08] text-white/50"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function StickyCards() {
  return (
    <section className="relative z-10 bg-[#010006] px-5 sm:px-8 md:px-10 pb-32">
      <div className="text-center mb-16 sm:mb-20 md:mb-28 px-6">
        <span className="inline-block text-xs font-mono tracking-[0.2em] text-[#F25604]/60 uppercase mb-4">
          Platform
        </span>
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-semibold text-[#F8FAFC]">
          How it{" "}
          <span className="bg-gradient-to-r from-[#F97316] to-[#F25604] bg-clip-text text-transparent">
            works
          </span>
        </h2>
      </div>
      <div className="max-w-6xl mx-auto">
        {features.map((feature, i) => (
          <FeatureCard key={feature.num} feature={feature} index={i} total={features.length} />
        ))}
      </div>
    </section>
  );
}
