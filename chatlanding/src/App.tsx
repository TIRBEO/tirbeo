import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { motion, useScroll, useTransform, useMotionTemplate } from "framer-motion";
import Lenis from "lenis";
import Nav from "@/components/Nav";

function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);
}

export default function LandingLayout() {
  useLenis();
  const { scrollY } = useScroll();
  const gradY = useTransform(scrollY, [0, 600], [0, 120]);
  const gradX = useTransform(scrollY, [0, 600], [50, 55]);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-background text-foreground">
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-70"
        style={{
          background: useMotionTemplate`radial-gradient(80% 50% at ${gradX}% ${gradY}px, oklch(0.06 0 0 / 0.6), transparent 60%)`,
        }}
      />
      <Nav />
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  );
}
