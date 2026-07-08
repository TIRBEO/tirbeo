"use client";

import { useRef } from "react";
import { useScroll, useTransform, motion } from "motion/react";
import { useSiteConfig } from "./SiteConfigProvider";

function AboutParagraph({ text, icon, index, textColor }: { text: string; icon: string; index: number; textColor: string }) {
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
        <p className="text-lg font-normal leading-relaxed md:text-2xl md:leading-relaxed lg:text-3xl lg:leading-relaxed" style={{ color: textColor }}>
          {text}
        </p>
      </div>
    </motion.div>
  );
}

export function AboutSection() {
  const config = useSiteConfig();
  const { about } = config;

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
            {about.headline.split(" ").slice(0, -1).join(" ")}{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(to right, ${about.headlineGradient})` }}
            >
              {about.headline.split(" ").pop()}
            </span>
          </h2>
        </div>

        {about.paragraphs.map((text, i) => (
          <AboutParagraph
            key={i}
            text={text}
            icon={String(i + 1).padStart(2, "0")}
            index={i}
            textColor={about.textColor}
          />
        ))}
      </div>
    </section>
  );
}
