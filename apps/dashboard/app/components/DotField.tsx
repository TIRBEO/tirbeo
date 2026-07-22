import { useEffect, useRef, memo } from 'react';
import './DotField.css';

const TWO_PI = Math.PI * 2;

interface DotFieldProps {
  dotRadius?: number;
  dotSpacing?: number;
  cursorRadius?: number;
  bulgeStrength?: number;
  waveAmplitude?: number;
  gradientFrom?: string;
  gradientTo?: string;
}

const DotField = memo(({
  dotRadius = 1,
  dotSpacing = 14,
  cursorRadius = 160,
  bulgeStrength = 10,
  waveAmplitude = 0,
  gradientFrom = 'rgba(255, 255, 255, 0.15)',
  gradientTo = 'rgba(255, 255, 255, 0.04)',
}: DotFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let w = 0;
    let h = 0;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function onMouseMove(e: MouseEvent) {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    }

    function tick() {
      const m = mouseRef.current;
      const t = performance.now() * 0.001;
      const step = dotRadius * 2 + dotSpacing;
      const cols = Math.ceil(w / step) + 1;
      const rows = Math.ceil(h / step) + 1;
      const padX = ((w - (cols - 1) * step) % step) / 2;
      const padY = ((h - (rows - 1) * step) % step) / 2;
      const rad = dotRadius;
      const cr = cursorRadius;
      const crSq = cr * cr;

      ctx.clearRect(0, 0, w, h);

      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, gradientFrom);
      grad.addColorStop(1, gradientTo);
      ctx.fillStyle = grad;

      ctx.beginPath();

      for (let row = 0; row < rows; row++) {
        const ay = padY + row * step;
        const dy = m.y - ay;
        const dySq = dy * dy;

        for (let col = 0; col < cols; col++) {
          const ax = padX + col * step;
          const dx = m.x - ax;
          const distSq = dx * dx + dySq;

          let drawX = ax;
          let drawY = ay;

          if (distSq < crSq) {
            const dist = Math.sqrt(distSq);
            const falloff = 1 - dist / cr;
            const push = falloff * falloff * bulgeStrength;
            const angle = Math.atan2(dy, dx);
            drawX -= Math.cos(angle) * push;
            drawY -= Math.sin(angle) * push;
          }

          ctx.moveTo(drawX + rad, drawY);
          ctx.arc(drawX, drawY, rad, 0, TWO_PI);
        }
      }

      ctx.fill();
      rafRef.current = requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [dotRadius, dotSpacing, cursorRadius, bulgeStrength, waveAmplitude, gradientFrom, gradientTo]);

  return (
    <div className="dot-field-container">
      <canvas ref={canvasRef} />
    </div>
  );
});

DotField.displayName = 'DotField';
export default DotField;
