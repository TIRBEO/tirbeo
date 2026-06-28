import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowUpRight } from "lucide-react";
import { getSections, getPricingPlans, type Section, type PricingPlan } from "@/lib/content";

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

export function Pricing() {
  const [section, setSection] = useState<Section | null>(null);
  const [plans, setPlans] = useState<PricingPlan[]>([]);

  useEffect(() => {
    getSections("home").then((sections) => {
      setSection(sections.find((s) => s.type === "pricing") || null);
    });
    getPricingPlans().then(setPlans);
  }, []);

  if (!plans.length) return null;

  return (
    <section className="bg-card/30 py-28">
      <Reveal className="mx-auto max-w-3xl px-6 text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-ink-soft">{section?.metadata?.label as string || "Pricing"}</p>
        <h2 className="mt-4 font-display text-4xl font-medium tracking-tight sm:text-5xl">
          {section?.title || "Honest pricing."}
          {section?.subtitle && <><br /><span className="italic text-ink-soft">{section.subtitle}</span></>}
        </h2>
      </Reveal>
      <div className="mx-auto mt-16 grid max-w-6xl gap-5 px-6 md:grid-cols-3">
        {plans.map((t, i) => (
          <Reveal key={t.id} delay={i * 0.08}>
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              className={`relative flex h-full flex-col rounded-3xl border p-8 shadow-soft ${
                t.is_popular
                  ? "border-ink-soft/30 bg-card text-foreground shadow-lift"
                  : "border-border bg-card text-foreground"
              }`}
            >
              {t.is_popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-border bg-muted px-4 py-1 font-mono text-[10px] uppercase tracking-widest text-ink-soft">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-2xl font-medium tracking-tight">{t.name}</h3>
              <p className="mt-1 text-xs text-ink-soft">{t.description}</p>
              <p className="mt-6">
                <span className="font-display text-5xl font-medium tracking-tight">
                  {t.price_monthly === 0 ? "Free" : t.price_monthly ? `$${t.price_monthly}` : "Custom"}
                </span>
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {(t.features || []).map((p: string) => (
                  <li key={p} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--moss)]" />
                    {p}
                  </li>
                ))}
              </ul>
              <a
                href={t.cta_href || "#"}
                className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all ${
                  t.is_popular
                    ? "bg-primary text-primary-foreground shadow-lift hover:-translate-y-0.5"
                    : "border border-border text-foreground hover:bg-muted"
                }`}
              >
                {t.cta_label}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
