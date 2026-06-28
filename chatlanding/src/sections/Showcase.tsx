import { useRef } from "react";
import { motion, useSpring } from "framer-motion";
import { Sparkles, ArrowUpRight, CornerDownRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
} as const;

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

function useTilt(strength = 14) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(0, { stiffness: 120, damping: 14 });
  const ry = useSpring(0, { stiffness: 120, damping: 14 });
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * strength);
    rx.set(-py * strength);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };
  return { ref, rx, ry, onMove, onLeave };
}

function PanelHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-3">
      <span className="h-2.5 w-2.5 rounded-full bg-border" />
      <span className="h-2.5 w-2.5 rounded-full bg-border" />
      <span className="h-2.5 w-2.5 rounded-full bg-border" />
      <span className="ml-3 truncate font-mono text-[11px] text-ink-soft">{label}</span>
    </div>
  );
}

function CmdKMock() {
  const tilt = useTilt(8);
  return (
    <div style={{ perspective: 1200 }}>
      <motion.div
        ref={tilt.ref}
        onPointerMove={tilt.onMove}
        onPointerLeave={tilt.onLeave}
        style={{ rotateX: tilt.rx, rotateY: tilt.ry, transformStyle: "preserve-3d" }}
        className="overflow-hidden rounded-3xl border border-border bg-card shadow-lift"
      >
        <PanelHeader label="⌘K — search everything" />
        <div className="p-5">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3">
            <Sparkles className="h-4 w-4 text-[var(--clay)]" />
            <span className="text-sm text-ink-soft">design systems</span>
            <span className="ml-auto rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[10px]">⌘K</span>
          </div>
          <div className="mt-4 space-y-1.5">
            {[
              { tag: "Community", t: "Design Systems Collective" },
              { tag: "Wiki", t: "Tokens & theming guide" },
              { tag: "Person", t: "Ada Lindqvist" },
              { tag: "Project", t: "Sprint 12 — Wiki editor" },
              { tag: "Event", t: "AMA · Token strategy" },
            ].map((r, i) => (
              <motion.button
                key={r.t}
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
              >
                <span className="flex items-center gap-3">
                  <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] text-ink-soft">
                    {r.tag}
                  </span>
                  <span className="text-sm">{r.t}</span>
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-ink-soft" />
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function Showcase() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-28">
      <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.22em] text-ink-soft">Built for focus</p>
          <h2 className="mt-4 font-display text-4xl font-medium tracking-tight sm:text-5xl">
            Calm by design.
            <br />
            <span className="italic text-[var(--clay)]">Powerful by default.</span>
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
            Keyboard-first navigation, threaded chat, rich profiles and a Notion-grade wiki —
            all rendered in a palette that doesn't shout at you.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              "Global CMD+K search across everything",
              "Granular roles & per-channel permissions",
              "Real-time presence under 100ms",
              "Accessible to WCAG 2.1 AA",
            ].map((t, i) => (
              <motion.li
                key={t}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="flex items-start gap-3"
              >
                <CornerDownRight className="mt-0.5 h-4 w-4 text-[var(--clay)]" />
                <span className="text-foreground">{t}</span>
              </motion.li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.15}>
          <CmdKMock />
        </Reveal>
      </div>
    </section>
  );
}
