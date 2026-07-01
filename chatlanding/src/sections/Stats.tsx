import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Users, MessageSquare, Globe, Zap } from "lucide-react";

function Counter({ end, decimals = 0, suffix = "" }: { end: number; decimals?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!inView) return;
    const duration = 2500;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * end;
      if (decimals > 0) {
        setCount(parseFloat(current.toFixed(decimals)));
      } else {
        setCount(Math.floor(current));
      }
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, end, decimals]);

  return (
    <span ref={ref}>
      {decimals > 0 ? count.toFixed(decimals) : count.toLocaleString()}
      {suffix}
    </span>
  );
}

function CountUpCard({
  stat,
  index,
}: {
  stat: { icon: React.ElementType; value: number; label: string; suffix: string; decimals?: number };
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col items-center text-center rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8 transition-all duration-300 hover:bg-card hover:border-border hover:shadow-soft"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground transition-all duration-300 group-hover:scale-105 group-hover:shadow-soft">
        <stat.icon className="h-6 w-6" />
      </div>
      <div className="text-3xl sm:text-4xl font-bold tabular-nums tracking-tight text-foreground">
        <Counter end={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
      </div>
      <div className="mt-1.5 text-sm text-muted-foreground">{stat.label}</div>
    </motion.div>
  );
}

export function Stats() {
  const stats = [
    { icon: Users, value: 12847, label: "Active Users", suffix: "+", decimals: 0 },
    { icon: MessageSquare, value: 254831, label: "Messages Sent", suffix: "+", decimals: 0 },
    { icon: Globe, value: 89, label: "Countries Reached", suffix: "", decimals: 0 },
    { icon: Zap, value: 99.98, label: "Uptime", suffix: "%", decimals: 2 },
  ];

  return (
    <section aria-label="Statistics" className="relative py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {stats.map((stat, i) => (
            <CountUpCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
