import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Hash, Circle, CheckCircle2 } from "lucide-react";

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

function DeckCard({
  children,
  progress,
  index,
  featured = false,
}: {
  children: React.ReactNode;
  progress: MotionValue<number>;
  index: number;
  featured?: boolean;
}) {
  const sign = index === 0 ? -1 : index === 2 ? 1 : 0;
  const rotateY = useTransform(progress, [0, 0.5, 1], [sign * 28, 0, sign * -18]);
  const y = useTransform(progress, [0, 0.5, 1], [120, 0, -60]);
  const scale = useTransform(progress, [0, 0.5, 1], [0.85, featured ? 1.05 : 0.95, 0.9]);
  const opacity = useTransform(progress, [0, 0.15, 0.85, 1], [0, 1, 1, 0.4]);

  return (
    <motion.div
      style={{ rotateY, y, scale, opacity, transformStyle: "preserve-3d" }}
      className={`overflow-hidden rounded-3xl border border-border bg-card shadow-lift will-change-transform ${
        featured ? "md:-mt-6 md:mb-6 z-10" : ""
      }`}
    >
      {children}
    </motion.div>
  );
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

function ChatPanel() {
  const msgs = [
    { who: "Ada", c: "var(--clay)", t: "Shipping the new resource library today — review?" },
    { who: "Ren", c: "var(--moss)", t: "On it. Pulling the wiki page now." },
    { who: "Ada", c: "var(--clay)", t: "Pinned the spec to #design-systems 📎" },
  ];
  return (
    <div className="flex h-full flex-col">
      <PanelHeader label="c/design-systems / #general" />
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 text-xs text-ink-soft">
        <Hash className="h-3.5 w-3.5" /> general · 142 online
      </div>
      <div className="flex-1 space-y-4 p-5">
        {msgs.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 * i, duration: 0.5 }}
            className="flex gap-3"
          >
            <span
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full font-display text-xs font-semibold text-background"
              style={{ background: m.c }}
            >
              {m.who[0]}
            </span>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold">{m.who}</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-ink-soft">now</span>
              </div>
              <p className="mt-0.5 text-xs leading-relaxed">{m.t}</p>
            </div>
          </motion.div>
        ))}
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-[11px] text-ink-soft">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--moss)]" />
          Mira is typing...
        </div>
      </div>
    </div>
  );
}

function KanbanPanel() {
  const cols = [
    {
      name: "In Progress",
      tone: "var(--clay)",
      items: [{ t: "Wiki block editor", a: "AD" }, { t: "Profile tabs", a: "RN" }],
    },
    {
      name: "Review",
      tone: "var(--moss)",
      items: [{ t: "Resource versioning", a: "MR" }],
    },
    { name: "Done", tone: "var(--ink-soft)", items: [{ t: "Event RSVPs", a: "JD" }] },
  ];
  return (
    <div className="flex h-full flex-col">
      <PanelHeader label="projects / sprint 12" />
      <div className="grid flex-1 grid-cols-3 gap-2 p-4">
        {cols.map((col, i) => (
          <div key={col.name} className="rounded-xl bg-muted/40 p-2.5">
            <div className="mb-2 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: col.tone }} />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
                {col.name}
              </span>
            </div>
            <div className="space-y-2">
              {col.items.map((it, j) => (
                <motion.div
                  key={it.t}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * (i + j), duration: 0.5 }}
                  className="rounded-lg border border-border bg-card p-2.5 shadow-soft"
                >
                  <p className="text-[11px] font-medium leading-snug">{it.t}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className="grid h-5 w-5 place-items-center rounded-full text-[9px] font-semibold text-background"
                      style={{ background: "var(--clay)" }}
                    >
                      {it.a}
                    </span>
                    {col.name === "Done" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-[var(--moss)]" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-ink-soft/50" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfilePanel() {
  const skills = ["Design Systems", "Type", "Motion", "React", "Wiki", "Strategy"];
  return (
    <div className="flex h-full flex-col">
      <PanelHeader label="@ada · profile" />
      <div className="relative h-20 bg-gradient-to-br from-[var(--clay)]/70 to-[var(--moss)]/60" />
      <div className="-mt-8 px-5 pb-5">
        <span className="grid h-16 w-16 place-items-center rounded-full border-4 border-card bg-[var(--clay)] font-display text-xl font-semibold text-background">
          A
        </span>
        <h4 className="mt-3 font-display text-lg font-medium">Ada Lindqvist</h4>
        <p className="text-[11px] text-ink-soft">Design lead · Northfold</p>
        <p className="mt-3 text-xs leading-relaxed text-ink-soft">
          Building calm interfaces for builders. Currently writing about type systems.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skills.map((s) => (
            <span
              key={s}
              className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] text-ink-soft"
            >
              {s}
            </span>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            ["1.2k", "rep"],
            ["48", "posts"],
            ["12", "projects"],
          ].map(([n, l]) => (
            <div key={l} className="rounded-lg border border-border bg-muted/40 py-2">
              <div className="font-display text-sm font-semibold">{n}</div>
              <div className="text-[9px] uppercase tracking-wider text-ink-soft">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PreviewDeck() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  return (
    <section
      id="preview"
      ref={sectionRef}
      className="relative overflow-hidden bg-card/40 py-32"
    >
      <Reveal className="mx-auto max-w-3xl px-6 text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-ink-soft">A peek inside</p>
        <h2 className="mt-4 font-display text-4xl font-medium tracking-tight sm:text-6xl">
          Your community,
          <br />
          <span className="italic text-[var(--clay)]">three angles at once.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-soft">
          Chat, projects and member profiles — float through the surfaces your community will live in.
        </p>
      </Reveal>

      <div
        className="relative mx-auto mt-20 grid max-w-6xl grid-cols-1 gap-6 px-6 md:grid-cols-3"
        style={{ perspective: 1600 }}
      >
        <DeckCard progress={scrollYProgress} index={0}>
          <ChatPanel />
        </DeckCard>
        <DeckCard progress={scrollYProgress} index={1} featured>
          <KanbanPanel />
        </DeckCard>
        <DeckCard progress={scrollYProgress} index={2}>
          <ProfilePanel />
        </DeckCard>
      </div>
    </section>
  );
}
