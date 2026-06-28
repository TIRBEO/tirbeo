import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import DarkVeil from "@/components/DarkVeil";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { getSections, type Section } from "@/lib/content";
import { ACCOUNTS_URL } from "@/lib/config";

function AnimWord({ text, delay = 0, italic = false }: { text: string; delay?: number; italic?: boolean }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ delay, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className={italic ? "inline-block italic text-ink-soft" : "inline-block"}
    >
      {text}
    </motion.span>
  );
}

export function Hero() {
  const { scrollY } = useScroll();
  const heroFade = useTransform(scrollY, [0, 400], [1, 0.6]);
  const [section, setSection] = useState<Section | null>(null);

  useEffect(() => {
    getSections("home").then((sections) => {
      setSection(sections.find((s) => s.type === "hero") || null);
    });
  }, []);

  const badge = (section?.metadata?.badge as string) || "New — Community wikis in beta";
  const words = section?.title?.split(" ").filter(Boolean) || ["Connect.", "Create.", "Collaborate."];
  const subtitle = section?.subtitle || "Tirbeo is the modern professional workspace for communities that learn, build and grow together — chat, discussions, resources, projects and events, woven into one calm, considered home.";
  const ctaLabel = (section?.metadata?.cta_label as string) || "Join Tirbeo";
  const ctaSecondary = (section?.metadata?.cta_secondary as string) || "See it in motion";

  return (
    <section className="relative overflow-hidden">
      <motion.div
        aria-hidden
        initial={{ y: '-100%' }}
        animate={{ y: 0 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="pointer-events-none absolute inset-x-0 top-0 h-[120%] opacity-40"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.8 }}
          className="h-full"
        >
          <DarkVeil warpAmount={0.03} speed={0.4} noiseIntensity={0.05} />
        </motion.div>
      </motion.div>
      <motion.div
        style={{ opacity: heroFade }}
        className="relative mx-auto grid max-w-7xl gap-16 px-6 pb-24 pt-28 lg:grid-cols-12 lg:gap-10 lg:pt-36"
      >
        <div className="lg:col-span-7">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-ink-soft"
          >
            <Sparkles className="h-3.5 w-3.5 text-[var(--clay)]" />
            {badge}
          </motion.span>

          <h1 className="mt-10 font-display text-[clamp(2.8rem,7vw,5.5rem)] font-medium leading-[1.02] tracking-tight">
            {words.map((word, i) => (
              <span key={i}>
                <AnimWord text={word} delay={0.1 + i * 0.15} italic={i === 1} />
                {i < words.length - 1 && " "}
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.7 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft"
          >
            {subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <a
              href={`${ACCOUNTS_URL}/signup?redirect_to=${encodeURIComponent(window.location.origin + "/auth/callback")}`}
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5"
            >
              {ctaLabel}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a
              href="#preview"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {ctaSecondary}
            </a>
          </motion.div>
        </div>
        <div className="hidden lg:col-span-5 lg:block" />
      </motion.div>
    </section>
  );
}
