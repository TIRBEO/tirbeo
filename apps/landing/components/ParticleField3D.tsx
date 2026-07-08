"use client";

import { useRef, useEffect } from "react";

export function ParticleField3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined") return;

    const ctx = canvas.getContext("2d")!;
    let animId = 0;
    let w = 0, h = 0;
    let mouseX = 0, mouseY = 0;

    interface Particle {
      x: number;
      y: number;
      z: number;
      size: number;
      speedX: number;
      speedY: number;
      speedZ: number;
      hue: number;
    }

    const particles: Particle[] = [];
    const PARTICLE_COUNT = 80;
    const DEPTH = 600;

    function resize() {
      w = canvas!.width = canvas!.offsetWidth;
      h = canvas!.height = canvas!.offsetHeight;
    }

    function init() {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: (Math.random() - 0.5) * w * 1.5,
          y: (Math.random() - 0.5) * h * 1.5,
          z: Math.random() * DEPTH,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          speedZ: Math.random() * 0.5 + 0.2,
          hue: 30 + Math.random() * 30,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      const centerX = w / 2 + (mouseX - w / 2) * 0.05;
      const centerY = h / 2 + (mouseY - h / 2) * 0.05;
      const t = performance.now() * 0.0008;

      const sorted = [...particles].sort((a, b) => a.z - b.z);

      for (const p of sorted) {
        p.x += p.speedX + Math.sin(t + p.z * 0.01) * 0.15;
        p.y += p.speedY + Math.cos(t + p.z * 0.01) * 0.15;
        p.z -= p.speedZ;
        if (p.z < 0) p.z = DEPTH;
        if (p.z > DEPTH) p.z = 0;

        if (p.x < -w) p.x = w;
        if (p.x > w) p.x = -w;
        if (p.y < -h) p.y = h;
        if (p.y > h) p.y = -h;

        const scale = 1 - p.z / DEPTH;
        const px = centerX + (p.x - centerX) * scale;
        const py = centerY + (p.y - centerY) * scale;
        const size = p.size * scale * 1.5;
        const opacity = scale * scale * 0.6;

        if (size < 0.2) continue;

        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue + (1 - scale) * 20}, 80%, 60%, ${opacity})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue + (1 - scale) * 20}, 80%, 60%, ${opacity * 0.12})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }

    resize();
    init();
    draw();

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-[1]"
      style={{ opacity: 0.6 }}
    />
  );
}
