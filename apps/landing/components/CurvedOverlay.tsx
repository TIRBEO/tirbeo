"use client";

import { useState, useEffect } from "react";

export function CurvedOverlay() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="fixed inset-0 z-40 pointer-events-none transition-opacity duration-1000"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        style={{ transform: "rotate(180deg)" }}
      >
        <defs>
          
        </defs>
        <path
          d="M0,400 C240,280 480,380 720,300 C960,220 1200,320 1440,260 L1440,900 L0,900 Z"
          fill="url(#curveGradient)"
          className="animate-drift-slow"
        />
        <path
          d="M0,450 C200,340 400,440 720,360 C1040,280 1280,400 1440,340 L1440,900 L0,900 Z"
          fill="url(#curveGradient)"
          className="animate-drift"
          opacity="0.7"
        />
        <path
          d="M0,500 C300,390 600,490 800,430 C1000,370 1200,490 1440,440 L1440,900 L0,900 Z"
          fill="url(#curveGradient)"
          className="animate-drift-slow"
          opacity="0.5"
        />
      </svg>

      <div className="absolute inset-0 bg-gradient-to-b from-[#010006] via-transparent to-transparent" />
    </div>
  );
}
