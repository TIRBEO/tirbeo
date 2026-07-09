"use client";

import { useRef, useEffect } from "react";

export function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined") return;

    const ctx = canvas.getContext("2d")!;
    let animId = 0;
    let w = 0, h = 0;

    const particles: { x: number; y: number; z: number; size: number; speedX: number; speedY: number; opacity: number; type: "circle" | "diamond" | "hex"; color: string }[] = [];

    const colors = ["#F25604", "#F97316", "#7A3EF2", "#2F4FC4", "#fff"];

    function resize() {
      w = canvas!.width = canvas!.offsetWidth * devicePixelRatio;
      h = canvas!.height = canvas!.offsetHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    }

    function init(count = 40) {
      particles.length = 0;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: Math.random() * 200 - 100,
          size: Math.random() * 6 + 2,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.4 + 0.1,
          type: (["circle", "diamond", "hex"] as const)[Math.floor(Math.random() * 3)],
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    }

    function drawShape(x: number, y: number, size: number, type: string, color: string, opacity: number) {
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;

      if (type === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === "diamond") {
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size, 0);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          const px = Math.cos(angle) * size;
          const py = Math.sin(angle) * size;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }

    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;

    function onMouse(e: MouseEvent) {
      targetMouseX = (e.clientX / (w / devicePixelRatio)) * 2 - 1;
      targetMouseY = (e.clientY / (h / devicePixelRatio)) * 2 - 1;
    }

    window.addEventListener("mousemove", onMouse);

    function frame() {
      ctx.clearRect(0, 0, w, h);

      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      particles.sort((a, b) => a.z - b.z);

      for (const p of particles) {
        p.x += p.speedX + mouseX * 0.1;
        p.y += p.speedY + mouseY * 0.1;

        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        const scale = 1 + p.z / 300;
        drawShape(p.x, p.y, p.size * Math.max(0.3, scale), p.type, p.color, p.opacity * Math.max(0.3, scale));
      }

      animId = requestAnimationFrame(frame);
    }

    resize();
    init(Math.min(60, Math.floor((w * h) / 40000)));
    frame();

    const ro = new ResizeObserver(() => { resize(); init(); });
    ro.observe(canvas.parentElement!);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouse);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
