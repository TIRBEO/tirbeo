import { useRef, useEffect } from "react";

interface DarkVeilProps {
  warpAmount?: number;
  speed?: number;
  noiseIntensity?: number;
}

export default function DarkVeil({
  warpAmount = 0.03,
  speed = 0.4,
  noiseIntensity = 0.05,
}: DarkVeilProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    // Check user preference for reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mediaQuery.matches;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = canvas.offsetWidth * window.devicePixelRatio);
    let h = (canvas.height = canvas.offsetHeight * window.devicePixelRatio);
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    let time = 0;
    let raf = 0;
    const noise = (x: number, y: number, t: number) => {
      const scale = 0.003;
      return (
        Math.sin(x * scale + t * 0.5) * Math.cos(y * scale + t) +
        Math.sin((x + y) * scale * 0.7 + t * 0.3) * 0.5
      );
    };

    const draw = () => {
      const logicalW = canvas.offsetWidth;
      const logicalH = canvas.offsetHeight;
      ctx.clearRect(0, 0, logicalW, logicalH);

      const gradient = ctx.createRadialGradient(
        logicalW * 0.5 + Math.sin(time * 0.3) * verticalAmplitude,
        logicalH * 0.3 + Math.cos(time * 0.2) * verticalAmplitude,
        0,
        logicalW * 0.5,
        logicalH * 0.5,
        logicalW * 0.8
      );

      const baseDark = prefersReducedMotion.current ? "hsl(0,0%,2%)" : `hsl(0,0%,${2 + noise(time * 20, 0, 0) * 1}%)`;
      gradient.addColorStop(0, "hsl(220,30%,8%)");
      gradient.addColorStop(0.5, baseDark);
      gradient.addColorStop(1, "hsl(220,20%,3%)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, logicalW, logicalH);

      // Draw subtle noise/noise lines
      if (!prefersReducedMotion.current && noiseIntensity > 0) {
        ctx.globalAlpha = noiseIntensity;
        for (let i = 0; i < 40; i++) {
          const x = Math.random() * logicalW;
          const y = Math.random() * logicalH;
          const length = 50 + Math.random() * 200;
          const angle = (time * 0.1 + i) * 0.5;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
          ctx.strokeStyle = "hsla(220,20%,30%,0.8)";
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      time += speed * 0.016;
      raf = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      w = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
    };
  }, [speed, noiseIntensity]);

  const verticalAmplitude = 40; // Define the amplitude

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      aria-hidden="true"
    />
  );
}
