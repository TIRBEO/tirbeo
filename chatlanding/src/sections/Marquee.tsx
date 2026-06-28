import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getSections, type Section } from "@/lib/content";

export function Marquee() {
  const [section, setSection] = useState<Section | null>(null);

  useEffect(() => {
    getSections("home").then((sections) => {
      setSection(sections.find((s) => s.type === "marquee") || null);
    });
  }, []);

  const logos = (section?.metadata?.logos as string[]) || ["Lumen", "Northfold", "Caravel", "Mossbrook", "Ember & Co", "Pagebound", "Field Notes", "Atrium"];
  const label = (section?.metadata?.label as string) || "Trusted by communities at";
  const row = [...logos, ...logos];

  return (
    <section className="overflow-hidden border-y border-border bg-card/40 py-10">
      <p className="mb-6 text-center text-xs uppercase tracking-[0.22em] text-ink-soft">
        {label}
      </p>
      <div className="relative">
        <motion.div
          className="flex w-max gap-14 px-6"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 35, ease: "linear", repeat: Infinity }}
        >
          {row.map((l, i) => (
            <span key={i} className="font-display text-2xl text-ink-soft/80">
              {l}
            </span>
          ))}
        </motion.div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
  );
}
