"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

const greetings = ["Hello", "Namaste", "Hola", "Bonjour", "Hallo", "Konnichiwa", "Marhaba", "Ni Hao", "Swagatam"];

export function Preloader() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    greetings.forEach((_, i) => {
      tl.to(textRef.current, {
        opacity: 0, y: -20, duration: 0.1,
        onComplete: () => { if (textRef.current) textRef.current.textContent = greetings[(i + 1) % greetings.length]; },
      }, i * 0.35)
      .to(textRef.current, { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" });
    });

    tl.to(overlayRef.current, {
      y: "-100%", duration: 1, ease: "power3.inOut", delay: 0.2,
      onComplete: () => { if (overlayRef.current) overlayRef.current.style.display = "none"; },
    });

    return () => { tl.kill(); };
  }, []);

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#010006]">
      <div ref={textRef} className="text-3xl font-bold text-white md:text-5xl">{greetings[0]}</div>
    </div>
  );
}
