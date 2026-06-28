import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { getSections, getTimelineEvents, type Section, type TimelineEvent } from "@/lib/content";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeUp}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StepCard({ step, num }: { step: TimelineEvent; num: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.3"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [0.88, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.4, 1], [0, 0.6, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [40, 0]);

  return (
    <div ref={ref}>
      <motion.div
        style={{ scale, opacity, y }}
        transition={{ type: "spring", stiffness: 180, damping: 20 }}
        className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-soft transition-shadow hover:shadow-lift"
      >
        <span className="font-mono text-xs tracking-widest text-ink-soft">{num}</span>
        <h3 className="mt-6 font-display text-2xl font-medium tracking-tight">{step.event}</h3>
        {step.description && (
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">{step.description}</p>
        )}
      </motion.div>
    </div>
  );
}

export function HowItWorks() {
  const [section, setSection] = useState<Section | null>(null);
  const [steps, setSteps] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    getSections("home").then((sections) => {
      setSection(sections.find((s) => s.type === "how-it-works") || null);
    });
    getTimelineEvents().then(setSteps);
  }, []);

  const display = steps.length > 0 ? steps.slice(0, 3) : [];

  return (
    <section className="mx-auto max-w-7xl px-6 py-28">
      <Reveal className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.22em] text-ink-soft">{section?.metadata?.label as string || "How it works"}</p>
        <h2 className="mt-4 font-display text-4xl font-medium tracking-tight sm:text-5xl">
          {section?.title || "Three steps."} {section?.subtitle ? <span className="italic text-ink-soft">{section.subtitle}</span> : <span className="italic text-ink-soft">No setup tax.</span>}
        </h2>
      </Reveal>
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {display.map((s, i) => (
          <StepCard key={s.id} step={s} num={`0${i + 1}`} />
        ))}
      </div>
    </section>
  );
}
