"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const paragraphs = [
  "Tirbeo is built to make social networking feel personal again. We believe the best online experiences come from genuine conversations, shared interests, and communities where people feel welcome. Instead of endless scrolling, our platform encourages meaningful interactions that create real value and lasting connections. Every feature is designed with people in mind — not engagement metrics. Connection should be intentional, organic, and human.",
  "Every feature is designed with people first. Whether you're discovering local communities that share your passions, meeting like-minded individuals who challenge your thinking, or sharing your own ideas with the world, Tirbeo provides a clean, distraction-free space where authentic conversations can naturally grow into something meaningful and lasting.",
  "We prioritize privacy, performance, and simplicity above all else. From end-to-end secure messaging to a blazing-fast experience on every device, Tirbeo is engineered to be reliable, intuitive, and respectful of your time and attention. No dark patterns, no algorithmic manipulation, no noise. Just a platform that puts you back in control of your experience.",
  "Our mission is straightforward: create a platform where people connect because they genuinely want to, not because an algorithm tells them to. Connection should be intentional, organic, and human. As Tirbeo grows, we remain deeply committed to building a safer, more thoughtful social experience for everyone who joins our community.",
  "Tirbeo is just getting started. We're building toward a future where communities have real ownership over their spaces, conversations are meaningful by default, and the internet feels like a place you want to be — not a place you're trapped in. The next chapter of social is here, and it's built around you and the people who matter most.",
  "Technology should serve people, not the other way around. Every decision we make at Tirbeo starts with a simple question: does this make human connection better? From our architecture to our interface, we strip away complexity so that what remains is pure, meaningful interaction between real people who share genuine interests.",
  "We believe in the power of local communities amplified by global reach. Tirbeo connects you to people in your district, your city, and your country — building bridges between neighbors while opening doors to the world. Your community starts where you are and extends as far as your curiosity takes you.",
  "The future of social is not about more time spent online — it's about better time spent. Tirbeo measures success not in minutes of attention extracted, but in meaningful connections formed, ideas shared, and communities strengthened. We're building a platform you can feel good about using.",
];

export function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const wrapper = wrapperRef.current;
    const list = listRef.current;
    if (!section || !wrapper || !list) return;

    const items = list.querySelectorAll<HTMLDivElement>("[data-focus]");
    const n = items.length;
    if (!n) return;

    let travel = 0;
    let initialY = 0;
    let centers: number[] = [];

    function measure() {
      centers = [];
      items.forEach((el) => centers.push(el.offsetTop + el.offsetHeight / 2));
      const vh2 = window.innerHeight / 2;
      initialY = centers.length ? vh2 - centers[0] : 0;
      travel = centers.length > 1 ? centers[centers.length - 1] - centers[0] : 0;
    }

    function update(p: number) {
      const y = initialY - travel * p;
      list.style.transform = `translateY(${y}px) translateZ(0)`;

      const vh2 = window.innerHeight / 2;
      const itemSpan = centers.length > 1 ? (centers[centers.length - 1] - centers[0]) / (n - 1) : 300;

      for (let i = 0; i < n; i++) {
        const elCenter = y + centers[i];
        const dist = Math.abs(elCenter - vh2) / itemSpan;

        const d = gsap.utils.clamp(0, 4, dist);
        const t = d - Math.floor(d);
        const idx = Math.floor(d);

        const opacity = [1, 0.7, 0.35, 0.12, 0][idx] + ([0.7, 0.35, 0.12, 0, 0][idx] - [1, 0.7, 0.35, 0.12, 0][idx]) * t;
        const blur = [0, 3, 6, 11, 18][idx] + ([3, 6, 11, 18, 18][idx] - [0, 3, 6, 11, 18][idx]) * t;
        const scale = [1.05, 0.95, 0.88, 0.82, 0.75][idx] + ([0.95, 0.88, 0.82, 0.75, 0.75][idx] - [1.05, 0.95, 0.88, 0.82, 0.75][idx]) * t;

        const el = items[i];
        el.style.opacity = String(opacity);
        el.style.filter = `blur(${blur}px)`;
        el.style.transform = `translateZ(0) scale(${scale})`;
        el.style.zIndex = String(Math.round(1000 - d * 250));
      }
    }

    measure();
    update(0);

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: () => `+=${travel + window.innerHeight}`,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onRefresh: (self) => {
        measure();
        update(self.progress);
      },
      onUpdate: (self) => update(self.progress),
    });

    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    ro.observe(wrapper);

    return () => {
      trigger.kill();
      ro.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative h-screen overflow-hidden bg-[#010006]"
      style={{ zIndex: 10 }}
    >
      <div className="absolute left-[5%] top-[20%] w-[500px] h-[500px] rounded-full bg-[#F25604]/5 blur-[150px] pointer-events-none" />
      <div className="absolute right-[5%] bottom-[10%] w-[400px] h-[400px] rounded-full bg-[#7A3EF2]/4 blur-[120px] pointer-events-none" />

      <div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
        }}
      />

      <div ref={wrapperRef} className="relative h-full w-full flex items-center justify-center overflow-hidden">
        <div ref={listRef} className="relative w-full flex flex-col items-center py-8">
          {paragraphs.map((text, i) => (
            <div
              key={i}
              data-focus
              className="flex flex-col items-center text-center w-full px-6 py-14 md:py-20"
            >
              <div className="max-w-4xl">
                <p className="text-lg font-normal leading-relaxed md:text-2xl md:leading-relaxed lg:text-3xl lg:leading-relaxed text-[#F97316]">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
