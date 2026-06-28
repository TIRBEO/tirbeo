import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getTestimonials, type Testimonial } from "@/lib/content";

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

export function Testimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);

  useEffect(() => {
    getTestimonials().then(setItems);
  }, []);

  if (!items.length) return null;

  return (
    <section className="bg-card/40 py-28">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-2">
        {items.map((q, i) => (
          <Reveal key={q.id} delay={i * 0.12}>
            <figure className="flex h-full flex-col justify-between rounded-3xl border border-border bg-card p-10 shadow-soft">
              <blockquote className="font-display text-2xl leading-snug tracking-tight">
                &ldquo;{q.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-10 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--clay)] font-display text-sm font-semibold text-background">
                  {q.author[0]}
                </span>
                <div>
                  <div className="text-sm font-semibold">{q.author}</div>
                  <div className="text-xs text-ink-soft">{q.role}</div>
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
