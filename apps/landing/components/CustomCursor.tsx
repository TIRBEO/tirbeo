"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    let mouseX = -100;
    let mouseY = -100;
    let x = -100;
    let y = -100;
    let scale = 1;
    let frame = 0;

    const interactive = "a, button, input, textarea, select, [role='button']";

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onOver = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest(interactive)) scale = 1.4;
    };

    const onOut = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest(interactive)) scale = 1;
    };

    const animate = () => {
      x += (mouseX - x) * 0.14;
      y += (mouseY - y) * 0.14;

      const t = performance.now() * 0.001;
      const hue = 280 + Math.sin(t * 0.4) * 90;

      const sx = 1 + Math.sin(t * 2) * 0.05;
      const sy = 1 + Math.cos(t * 2 + 1) * 0.05;

      cursor.style.background = `linear-gradient(135deg, hsla(${hue}, 85%, 55%, 0.25), hsla(${hue + 40}, 80%, 45%, 0.2))`;
      cursor.style.borderColor = `hsla(${hue + 20}, 80%, 65%, 0.3)`;
      cursor.style.boxShadow = `0 10px 35px hsla(${hue + 10}, 80%, 55%, 0.15), inset 0 1px 1px hsla(${hue + 30}, 80%, 70%, 0.2)`;
      cursor.style.transform = `
        translate3d(${x}px, ${y}px, 0)
        translate(-50%, -50%)
        scale(${scale * sx}, ${scale * sy})
        rotate(${Math.sin(t * 2) * 5}deg)
      `;

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver, true);
    document.addEventListener("mouseout", onOut, true);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver, true);
      document.removeEventListener("mouseout", onOut, true);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed left-0 top-0 z-[9999] h-10 w-10 rounded-[42%_58%_63%_37%/41%_44%_56%_59%]"
      style={{
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1.5px solid",
        willChange: "transform, background",
      }}
    />
  );
}
