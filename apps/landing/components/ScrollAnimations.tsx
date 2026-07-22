"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ScrollAnimations({ children }: { children: React.ReactNode }) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const reveals = el.querySelectorAll<HTMLElement>(".gsap-reveal");
      if (!reveals.length) return;

      gsap.fromTo(reveals,
        { opacity: 0, y: 80, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.2,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
          },
        },
      );

      const parallaxItems = el.querySelectorAll<HTMLElement>(".gsap-parallax");
      parallaxItems.forEach((item) => {
        const speed = parseFloat(item.dataset.speed || "0.15");
        gsap.to(item, {
          y: () => window.innerHeight * speed,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        });
      });

      const cards = el.querySelectorAll<HTMLElement>(".gsap-stagger-card");
      if (cards.length) {
        gsap.fromTo(cards,
          { opacity: 0, y: 60, scale: 0.9 },
          {
            opacity: 1, y: 0, scale: 1,
            stagger: 0.15,
            duration: 1,
            ease: "back.out(1.4)",
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
              once: true,
            },
          },
        );
      }
    }, el);

    return () => ctx.revert();
  }, []);

  return <div ref={sectionRef}>{children}</div>;
}
