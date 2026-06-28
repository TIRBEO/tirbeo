import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Users, MessageSquare, Globe, Zap } from "lucide-react";

function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, end]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export function Stats() {
  const stats = [
    { icon: Users, value: 12847, label: "Active Users", suffix: "+" },
    { icon: MessageSquare, value: 254831, label: "Messages Sent", suffix: "+" },
    { icon: Globe, value: 89, label: "Countries Reached", suffix: "" },
    { icon: Zap, value: 99.98, label: "Uptime", suffix: "%" },
  ];

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-800 border border-neutral-700">
                <stat.icon className="h-6 w-6 text-neutral-300" />
              </div>
              <div className="text-4xl font-bold text-white mb-1">
                <Counter end={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-neutral-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
