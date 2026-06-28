import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { getSections, type Section } from "@/lib/content";
import { ACCOUNTS_URL } from "@/lib/config";

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

export function CTA() {
  const [section, setSection] = useState<Section | null>(null);

  useEffect(() => {
    getSections("home").then((sections) => {
      setSection(sections.find((s) => s.type === "cta") || null);
    });
  }, []);

  const label = (section?.metadata?.label as string) || "Start your community";
  const title = section?.title || "A warmer place to build with the people you respect.";
  const ctaLabel = (section?.metadata?.cta_label as string) || "Join Tirbeo";
  const ctaSecondary = (section?.metadata?.cta_secondary as string) || "Talk to the team";

  return (
    <section className="px-6 py-28">
      <Reveal className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-12 text-foreground shadow-lift sm:p-16">
          <motion.div
            aria-hidden
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-20 blur-3xl"
            style={{ background: "conic-gradient(from 0deg, var(--clay), var(--moss), var(--clay))" }}
          />
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-ink-soft">
            {label}
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl font-medium leading-tight tracking-tight sm:text-6xl">
            {title}
          </h2>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={`${ACCOUNTS_URL}/signup?redirect_to=${encodeURIComponent(window.location.origin + "/auth/callback")}`}
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5"
            >
              {ctaLabel}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3.5 text-sm font-medium text-ink-soft transition-colors hover:bg-muted"
            >
              {ctaSecondary}
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
