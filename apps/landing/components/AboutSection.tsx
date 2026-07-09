"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stages = [
  {
    body: "Tirbeo is built to make social networking feel personal again. We believe the best online experiences come from genuine conversations, shared interests, and communities where people feel welcome. Instead of endless scrolling, our platform encourages meaningful interactions that create real value and lasting connections.",
  },
  {
    body: "Every feature is designed with people in mind. Whether you're discovering local communities, meeting like-minded individuals, or sharing your ideas with the world, Tirbeo provides a clean, distraction-free space where authentic conversations can naturally grow.",
  },
  {
    body: "We prioritize privacy, performance, and simplicity. From secure messaging and modern technology to a fast, responsive experience across every device, Tirbeo is built to be reliable, intuitive, and respectful of your time and attention.",
  },
  {
    body: "Our mission is simple: create a platform where people connect because they genuinely want to—not because an algorithm tells them to. As Tirbeo grows, we remain committed to building a safer, more thoughtful, and more human social experience for everyone.",
  },
];

export function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const titleRef = useRef<HTMLDivElement>(null);
  const blobARef = useRef<HTMLDivElement>(null);
  const blobBRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const panels = panelsRef.current.filter(Boolean) as HTMLDivElement[];
    if (!section || !pin || !panels.length) return;

    const ctx = gsap.context(() => {
      gsap.to(blobARef.current, {
        x: 60,
        y: -40,
        duration: 14,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
      gsap.to(blobBRef.current, {
        x: -50,
        y: 50,
        duration: 18,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      gsap.fromTo(
        titleRef.current,
        { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
        {
          opacity: 0,
          y: -60,
          scale: 0.88,
          filter: "blur(8px)",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=50%",
            scrub: 0.6,
          },
        },
      );

      gsap.set(panels, { opacity: 0, y: 80, scale: 0.85, rotationY: -45, rotationX: 12, z: -100, filter: "blur(6px)", force3D: true });

      const pinSt = ScrollTrigger.create({
        trigger: pin,
        start: "top top",
        end: `+=${panels.length * 120}%`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });

      const total = panels.length;
      const tl = gsap.timeline({ paused: true });

      panels.forEach((panel, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        const start = i / total;
        const mid = (i + 0.5) / total;
        const end = (i + 1) / total;

        tl.to(panel, {
          opacity: 1,
          y: 0,
          scale: 1,
          rotationY: 0,
          rotationX: 0,
          z: 0,
          filter: "blur(0px)",
          duration: mid - start,
          ease: "power2.out",
          force3D: true,
        }, start);

        tl.to(panel, {
          opacity: 1,
          y: 0,
          scale: 1,
          rotationY: 0,
          rotationX: 0,
          z: 0,
          filter: "blur(0px)",
          duration: end - mid - 0.05,
          ease: "none",
          force3D: true,
        }, mid);

        tl.to(panel, {
          opacity: 0,
          y: -60,
          scale: 0.88,
          rotationY: 45 * dir,
          rotationX: -8,
          z: -80,
          filter: "blur(4px)",
          duration: 0.05,
          ease: "power2.in",
          force3D: true,
        }, end - 0.05);
      });

      ScrollTrigger.create({
        trigger: pin,
        start: "top top",
        end: `+=${total * 120}%`,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (stSelf) => {
          tl.progress(stSelf.progress);
        },
      });

      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="about" className="relative overflow-hidden bg-[#010006]">
      <div
        ref={blobARef}
        className="pointer-events-none absolute left-[8%] top-[10%] h-[38rem] w-[38rem] rounded-full opacity-[0.10] blur-[120px]"
        style={{ background: "#F25604" }}
      />
      <div
        ref={blobBRef}
        className="pointer-events-none absolute bottom-[5%] right-[10%] h-[32rem] w-[32rem] rounded-full opacity-[0.08] blur-[120px]"
        style={{ background: "#7A3EF2" }}
      />

      <div className="relative h-screen flex items-center justify-center px-6">
        <div ref={titleRef} className="text-center">
          <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.3em] text-white/20">
            About
          </span>
          <h2
            className="mt-3 text-6xl font-bold tracking-tight md:text-8xl lg:text-9xl"
            style={{ color: "#F25604", textShadow: "0 0 120px rgba(242,86,4,0.3)" }}
          >
            Tirbeo
          </h2>
          <p className="mt-3 text-xs uppercase tracking-[0.35em] text-white/15">
            A new kind of social platform
          </p>
        </div>
      </div>

      <div ref={pinRef} className="relative h-screen overflow-hidden">
        <div className="absolute inset-0" style={{ perspective: 1200 }}>
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2"
            style={{
              background:
                "linear-gradient(to bottom, transparent, rgba(242,86,4,0.16) 15%, rgba(242,86,4,0.16) 85%, transparent)",
            }}
          />

          {stages.map((stage, i) => (
            <div
              key={`panel-${i}`}
              className="absolute inset-0 flex items-center justify-center px-6"
            >
              <div
                ref={(el) => {
                  panelsRef.current[i] = el;
                }}
                className="relative w-full max-w-4xl text-center"
                style={{
                  willChange: "transform, opacity, filter",
                  backfaceVisibility: "hidden",
                  transformStyle: "preserve-3d",
                }}
              >
                <div className="mb-6 flex items-center justify-center">
                  <span
                    className="block h-2 w-2 rounded-full"
                    style={{ background: "#F25604", boxShadow: "0 0 20px rgba(242,86,4,0.6)" }}
                  />
                </div>

                <span
                  className="mx-auto mb-8 block h-px w-[120px]"
                  style={{ background: "linear-gradient(90deg, transparent, #F25604, transparent)" }}
                />

                <p
                  className="text-2xl leading-relaxed text-[#F25604] md:text-3xl md:leading-relaxed lg:text-4xl lg:leading-relaxed"
                  style={{ textShadow: "0 0 60px rgba(0,0,0,0.4)" }}
                >
                  {stage.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
