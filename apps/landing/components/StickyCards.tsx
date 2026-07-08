'use client';
import { useRef } from 'react';
import { useScroll, useTransform, motion } from 'motion/react';

const projects = [
  {
    num: '01',
    label: 'Client',
    name: 'Nextlevel Studio',
    col1: [
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055344_5eff02e0-87a5-41ce-b64f-eb08da8f33db.png&w=1280&q=85',
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055431_11d841fd-8b41-46a5-82e4-b04f2407a7d8.png&w=1280&q=85',
    ],
    col2: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055451_e317bf2d-28d4-48cc-86b0-6f72f25b6327.png&w=1280&q=85',
  },
  {
    num: '02',
    label: 'Personal',
    name: 'Aura Brand Identity',
    col1: [
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055654_911201c5-36d9-4bc6-bac7-331adfce159f.png&w=1280&q=85',
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055723_5ceda0b8-d9c2-4665-b2e3-83ba19ba76d1.png&w=1280&q=85',
    ],
    col2: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055753_adc5dcbd-a8e6-49c0-b43a-9b030d835cea.png&w=1280&q=85',
  },
  {
    num: '03',
    label: 'Client',
    name: 'Solaris Digital',
    col1: [
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055759_963cfb0b-4bd1-4b0f-9d0a-09bd6cf95b2f.png&w=1280&q=85',
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_060108_438f781a-9846-4dcc-89ab-c4e6cb830f5b.png&w=1280&q=85',
    ],
    col2: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055818_9d062121-ad7e-46b9-999a-1a6a692ef1ee.png&w=1280&q=85',
  },
];

function ProjectCard({ project, index, total }: { project: typeof projects[0]; index: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'start start'],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1 - (total - 1 - index) * 0.04, 1]);

  return (
    <div ref={ref} className="sticky" style={{ top: `${100 + index * 28}px`, height: '85vh' }}>
      <motion.div
        className="w-full h-full rounded-[40px] sm:rounded-[50px] md:rounded-[60px] border-2 border-[#D7E2EA]/20 bg-[#010006] p-4 sm:p-6 md:p-8 flex flex-col overflow-hidden"
        style={{ scale, transformOrigin: 'top center' }}
      >
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <span className="font-black text-[clamp(2rem,8vw,100px)] text-white/10 leading-none">{project.num}</span>
            <div>
              <span className="text-[10px] sm:text-xs font-medium uppercase tracking-widest text-white/40">{project.label}</span>
              <h3 className="text-lg sm:text-2xl font-semibold text-white mt-1">{project.name}</h3>
            </div>
          </div>
          <button className="shrink-0 rounded-full border-2 border-[#D7E2EA] px-6 sm:px-8 py-2 sm:py-3 text-[10px] sm:text-xs font-medium uppercase tracking-widest text-[#D7E2EA] hover:bg-white/10 transition-colors">
            Live Project
          </button>
        </div>

        <div className="flex-1 flex gap-3 sm:gap-4 min-h-0">
          <div className="flex flex-col gap-3 sm:gap-4 w-[40%]">
            <div className="flex-1 rounded-[40px] sm:rounded-[50px] md:rounded-[60px] overflow-hidden">
              <img src={project.col1[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="flex-1 rounded-[40px] sm:rounded-[50px] md:rounded-[60px] overflow-hidden">
              <img src={project.col1[1]} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
          </div>
          <div className="w-[60%] rounded-[40px] sm:rounded-[50px] md:rounded-[60px] overflow-hidden">
            <img src={project.col2} alt="" className="w-full h-full object-cover" loading="lazy" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function StickyCards() {
  return (
    <section className="relative z-10 bg-[#010006] px-5 sm:px-8 md:px-10 pb-32">
      <h2 className="text-center font-black uppercase leading-none tracking-tight text-[clamp(2.5rem,10vw,140px)] mb-16 sm:mb-20 md:mb-28 bg-gradient-to-b from-white/90 to-white/30 bg-clip-text text-transparent">
        Projects
      </h2>
      <div className="max-w-6xl mx-auto">
        {projects.map((project, i) => (
          <ProjectCard key={project.num} project={project} index={i} total={projects.length} />
        ))}
      </div>
    </section>
  );
}
