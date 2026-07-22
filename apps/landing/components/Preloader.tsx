"use client";

import { useState, useEffect, useCallback } from "react";

const greetings = [
  { text: "Hello", lang: "EN" },
  { text: "नमस्ते", lang: "NP" },
  { text: "Hola", lang: "ES" },
  { text: "Bonjour", lang: "FR" },
  { text: "Hallo", lang: "DE" },
  { text: "こんにちは", lang: "JA" },
  { text: "مرحبا", lang: "AR" },
  { text: "你好", lang: "ZH" },
  { text: "स्वागतम्", lang: "SA" },
];

export function Preloader() {
  const [isVisible, setIsVisible] = useState(true);
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  const isLast = greetingIndex === greetings.length - 1;

  const handleSkip = useCallback(() => {
    setIsVisible(false);
  }, []);

  useEffect(() => {
    setMounted(true);
    const cycle = setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % greetings.length);
    }, 380);
    const timer = setTimeout(() => {
      clearInterval(cycle);
      handleSkip();
    }, 3500);
    return () => {
      clearTimeout(timer);
      clearInterval(cycle);
    };
  }, [handleSkip]);



  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "#0B0B0D" }}
      onClick={handleSkip}
      onKeyDown={(e) => e.key === "Escape" && handleSkip()}
      tabIndex={0}
      role="dialog"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center justify-center gap-4 px-8">
        <div className="text-center" key={greetingIndex}>
          <h1
            className={`text-5xl md:text-6xl font-bold tracking-tight transition-transform duration-300 ${isLast ? "scale-110" : ""}`}
            style={{ color: "#F25604", textShadow: "0 0 20px rgba(242,86,4,0.6)" }}
          >
            {greetings[greetingIndex].text}
          </h1>
          <p className="mt-2 text-sm font-medium tracking-widest uppercase" style={{ color: "#F25604" }}>
            {greetings[greetingIndex].lang}
          </p>
        </div>
      </div>
    </div>
  );
}
