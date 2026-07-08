"use client";

import { useRef } from "react";
import { useScroll, useTransform, motion } from "motion/react";

const paragraphs = [
  {
    text: "Tirbeo is built to make social networking feel personal again. We believe the best online experiences come from genuine conversations, shared interests, and communities where people feel welcome. Instead of endless scrolling, our platform encourages meaningful interactions that create real value and lasting connections. Every feature is designed with people in mind — not engagement metrics. Connection should be intentional, organic, and human.",
    icon: "01",
  },
  {
    text: "Every feature is designed with people first. Whether you're discovering local communities that share your passions, meeting like-minded individuals who challenge your thinking, or sharing your own ideas with the world, Tirbeo provides a clean, distraction-free space where authentic conversations can naturally grow into something meaningful and lasting.",
    icon: "02",
  },
  {
    text: "We prioritize privacy, performance, and simplicity above all else. From end-to-end secure messaging to a blazing-fast experience on every device, Tirbeo is engineered to be reliable, intuitive, and respectful of your time and attention. No dark patterns, no algorithmic manipulation, no noise. Just a platform that puts you back in control of your experience.",
    icon: "03",
  },
  {
    text: "Our mission is straightforward: create a platform where people connect because they genuinely want to, not because an algorithm tells them to. Connection should be intentional, organic, and human. As Tirbeo grows, we remain deeply committed to building a safer, more thoughtful social experience for everyone who joins our community.",
    icon: "04",
  },
  {
    text: "Tirbeo is just getting started. We're building toward a future where communities have real ownership over their spaces, conversations are meaningful by default, and the internet feels like a place you want to be — not a place you're trapped in. The next chapter of social is here, and it's built around you and the people who matter most.",
    icon: "05",
  },
  {
    text: "Technology should serve people, not the other way around. Every decision we make at Tirbeo starts with a simple question: does this make human connection better? From our architecture to our interface, we strip away complexity so that what remains is pure, meaningful interaction between real people who share genuine interests.",
    icon: "06",
  },
  {
    text: "We believe in the power of local communities amplified by global reach. Tirbeo connects you to people in your district, your city, and your country — building bridges between neighbors while opening doors to the world. Your community starts where you are and extends as far as your curiosity takes you.",
    icon: "07",
  },
  {
    text: "The future of social is not about more time spent online — it's about better time spent. Tirbeo measures success not in minutes of attention extracted, but in meaningful connections formed, ideas shared, and communities strengthened. We're building a platform you can feel good about using.",
    icon: "08",
  },
];

function AboutParagraph({ text, icon, index }: { text: string; icon: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.15"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [60, 0, 0, -40]);
  const scale = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0.92, 1, 1, 0.96]);
  const blur = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], ["8px", "0px", "0px", "4px"]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y, scale, filter: `blur(${blur})` } as any}
      className="flex flex-col items-center text-center w-full px-6 py-24 md:py-32"
    >
      <span className="text-[#F25604]/20 text-sm font-mono tracking-widest mb-4">
        {icon}
      </span>
      <div className="max-w-4xl">
        <p className="text-lg font-normal leading-relaxed md:text-2xl md:leading-relaxed lg:text-3xl lg:leading-relaxed text-[#F97316]">
          {text}
        </p>
      </div>
    </motion.div>
  );
}

export function AboutSection() {
  return (
    <section
      id="about"
      className="relative overflow-hidden bg-[#010006]"
      style={{ zIndex: 10 }}
    >
      <div className="absolute left-[5%] top-[20%] w-[500px] h-[500px] rounded-full bg-[#F25604]/5 blur-[150px] pointer-events-none" />
      <div className="absolute right-[5%] bottom-[10%] w-[400px] h-[400px] rounded-full bg-[#7A3EF2]/4 blur-[120px] pointer-events-none" />

      <div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
        }}
      />

      <div className="relative w-full flex flex-col items-center py-16 md:py-24">
        <div className="text-center mb-16 md:mb-24 px-6">
          <span className="inline-block text-xs font-mono tracking-[0.2em] text-[#F25604]/60 uppercase mb-4">
            About Tirbeo
          </span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-semibold text-[#F8FAFC]">
            Built for{" "}
            <span className="bg-gradient-to-r from-[#F97316] to-[#F25604] bg-clip-text text-transparent">
              meaningful connection
            </span>
          </h2>
        </div>

        {paragraphs.map((p, i) => (
          <AboutParagraph key={i} text={p.text} icon={p.icon} index={i} />
        ))}
      </div>
    </section>
  );
}
