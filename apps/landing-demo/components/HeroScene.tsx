"use client";

import { useRef, useEffect } from "react";

export function HeroScene() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    let id = 0, w = 0, h = 0;

    const ps: { x: number; y: number; r: number; dx: number; dy: number; o: number }[] = [];

    function resize() {
      w = c!.width = c!.offsetWidth * devicePixelRatio;
      h = c!.height = c!.offsetHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    }

    function init(n = 30) {
      ps.length = 0;
      for (let i = 0; i < n; i++) {
        ps.push({
          x: Math.random() * (w / devicePixelRatio),
          y: Math.random() * (h / devicePixelRatio),
          r: Math.random() * 2 + 0.5,
          dx: (Math.random() - 0.5) * 0.15,
          dy: (Math.random() - 0.5) * 0.15,
          o: Math.random() * 0.3 + 0.05,
        });
      }
    }

    let mx = 0, my = 0, tmx = 0, tmy = 0;
    const onMouse = (e: MouseEvent) => { tmx = e.clientX; tmy = e.clientY; };
    window.addEventListener("mousemove", onMouse);

    function frame() {
      ctx.clearRect(0, 0, w, h);
      mx += (tmx - mx) * 0.05;
      my += (tmy - my) * 0.05;

      const cw = w / devicePixelRatio;
      const ch = h / devicePixelRatio;

      for (const p of ps) {
        p.x += p.dx + (mx - cw / 2) * 0.0003;
        p.y += p.dy + (my - ch / 2) * 0.0003;

        if (p.x < -10) p.x = cw + 10;
        if (p.x > cw + 10) p.x = -10;
        if (p.y < -10) p.y = ch + 10;
        if (p.y > ch + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(242, 86, 4, ${p.o})`;
        ctx.fill();
      }

      id = requestAnimationFrame(frame);
    }

    resize();
    init();
    frame();

    const ro = new ResizeObserver(() => { resize(); init(); });
    ro.observe(c.parentElement!);

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("mousemove", onMouse);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas ref={ref}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
