import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getIcon } from "@/lib/icons";
import { getSections, getFeatures, type Section, type Feature } from "@/lib/content";

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

export function Features() {
  const [section, setSection] = useState<Section | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);

  useEffect(() => {
    getSections("home""
).then((sections) => {
      const sec = sections.find((s) => s.type === "features") || null;
      setSection(sec);
      if (sec) getFeatures(sec.id).then(setFeatures);
    });
  }, []);

  return (
    <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 py-28" aria-label="Features">
      <Reveal className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          {(section?.metadata?.label as string) || "One workspace, many rooms"}
        </p>
        <h2 className="mt-4 font-display text-4xl font-medium tracking-tight sm:text-5xl">
          {section?.title || "Everything your community does,"}
          {section?.subtitle && <span className="italic text-[var(--clay)]"> {section.subtitle}</span>}
        </h2>
      </Reveal>

      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => {
          const Icon = getIcon(f.icon);
          return (
            <Reveal key={f.id} delay={i * 0.08}>
              <motion.article
                whileHover={{ y: -6, rotateX: 4, rotateY: -4 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                style={{ transformStyle: "preserve-3d" }}
                className="group relative flex h-full flex-col rounded-2xl border border-border/60 bg-card/60 p-7 shadow-soft hover:shadow-lift hover:bg-card transition-colors duration-300"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-secondary-foreground transition-all duration-300 group-hover:bg-[var(--clay)] group-hover:text-background group-hover:shadow-soft">
                  <Icon className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <h3 className="mt-6 font-display text-2xl font-medium tracking-tight">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                <span className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                  0{i + 1} / {String(features.length).padStart(2, "0")}
                </span>
              </motion.article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
