import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { getSections, getFAQs, type Section, type FAQ as FAQType } from "@/lib/content";

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

export function FAQ() {
  const [section, setSection] = useState<Section | null>(null);
  const [faqs, setFaqs] = useState<FAQType[]>([]);
  const [open, setOpen] = useState<number | null>(0);

  useEffect(() => {
    getSections("home").then((sections) => {
      setSection(sections.find((s) => s.type === "faq") || null);
    });
    getFAQs().then(setFaqs);
  }, []);

  if (!faqs.length) return null;

  return (
    <section className="mx-auto max-w-5xl px-6 py-28">
      <Reveal className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.22em] text-ink-soft">{section?.metadata?.label as string || "Questions"}</p>
        <h2 className="mt-4 font-display text-4xl font-medium tracking-tight sm:text-5xl">
          {section?.title || "Things people"} {section?.subtitle ? <><span className="italic text-ink-soft">{section.subtitle}</span></> : <span className="italic text-ink-soft">usually ask.</span>}
        </h2>
      </Reveal>
      <div className="mt-12 divide-y divide-border rounded-3xl border border-border bg-card">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.id} className="px-6">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-6 py-6 text-left"
              >
                <span className="font-display text-lg font-medium tracking-tight">{f.question}</span>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border text-foreground">
                  {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </span>
              </button>
              <motion.div
                initial={false}
                animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <p className="pb-6 pr-12 text-sm leading-relaxed text-ink-soft">{f.answer}</p>
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
