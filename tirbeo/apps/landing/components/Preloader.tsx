"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const greetings = [
  { text: "Hello", lang: "EN" },
  { text: "नमस्ते", lang: "NP" },
  { text: "नमस्कार", lang: "HI" },
  { text: "こんにちは", lang: "JP" },
  { text: "안녕하세요", lang: "KR" },
  { text: "Bonjour", lang: "FR" },
  { text: "Hola", lang: "ES" },
  { text: "你好", lang: "ZH" },
  { text: "مرحبا", lang: "AR" },
  { text: "Olá", lang: "PT" },
  { text: "Ciao", lang: "IT" },
  { text: "Hallo", lang: "DE" },
];

// Generate consistent gradient strings
const generateGradient = (hue: number, opacity: number): string => {
  return `linear-gradient(135deg, hsla(${hue}, 85%, 55%, ${opacity}) 0%, hsla(${hue + 40}, 75%, 45%, ${opacity}) 100%)`;
};

export function Preloader({ onSkip }: { onSkip?: () => void }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [currentGreeting, setCurrentGreeting] = useState(greetings[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hue, setHue] = useState(220);
  const [bgGradient1, setBgGradient1] = useState('');
  const [bgGradient2, setBgGradient2] = useState('');
  const preloaderRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef(220);
  const lastSkipTime = useRef<number>(0);
  const skipCooldown = 100;

  // Set initial greeting
  useEffect(() => {
    setCurrentGreeting(greetings[0]);
    hueRef.current = 220;
    setHue(220);
    const hue1 = hueRef.current + 20;
    const hue2 = hueRef.current - 30;
    setBgGradient1(generateGradient(hue1, 0.1));
    setBgGradient2(generateGradient(hue2, 0.1));
  }, []);

  // Smooth hue animation
  useEffect(() => {
    const animateHue = () => {
      const t = performance.now() * 0.001;
      hueRef.current = 220 + Math.sin(t * 0.4) * 60;
      setHue(hueRef.current);
    };

    const interval = setInterval(animateHue, 16);
    return () => clearInterval(interval);
  }, []);

  const handleSkip = () => {
    const now = Date.now();
    if (now - lastSkipTime.current < skipCooldown) {
      return;
    }
    
    lastSkipTime.current = now;
    setIsExiting(true);
    
    setTimeout(() => {
      setIsVisible(false);
      if (onSkip) {
        onSkip();
      }
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = 'unset';
    }, 800);
  };

  // Auto-skip after greeting cycle
  useEffect(() => {
    if (isVisible && !isExiting) {
      const timer = setTimeout(() => {
        handleSkip();
      }, 4200);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isExiting]);

  // Cycle greetings
  useEffect(() => {
    const cycleGreeting = () => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        const nextIndex = (greetingIndex + 1) % greetings.length;
        setGreetingIndex(nextIndex);
        setCurrentGreeting(greetings[nextIndex]);
        setIsTransitioning(false);
      }, 150);
    };

    const interval = setInterval(cycleGreeting, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [greetingIndex]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={preloaderRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-xl"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
          transition={{ duration: 0.8, ease: "cubic-bezier(0.4, 0, 0.2, 1)" }}
        >
          <div className="relative w-full max-w-4xl px-8">
            {/* Background effects */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{ background: generateGradient(hue, 0.05) }}
            />
            
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{ background: bgGradient1 }}
            />
            
            {/* Main content container with glassmorphism */}
            <motion.div
              className="relative flex flex-col items-center justify-center gap-12 px-16 py-20"
              style={{
                zIndex: 10002,
                background: generateGradient(hue, 0.08),
                border: `1px solid hsla(${hue}, 40%, 80%, 0.2)`,
                borderRadius: '32px',
                boxShadow: `0 20px 60px hsla(${hue + 10}, 60%, 50%, 0.08), inset 0 1px 0 hsla(${hue + 30}, 60%, 80%, 0.1)`,
                animation: 'softPulse 3s ease-in-out infinite'
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6, ease: "cubic-bezier(0.4, 0, 0.2, 1)" }}
            >
              {/* Logo/Branding */}
              <motion.div 
                className="relative"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-500/30 backdrop-blur-xl border border-blue-200/50 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400/50 to-indigo-400/50 animate-spin" style={{ animationDuration: '3s' }} />
                </div>
              </motion.div>

              {/* Greeting */}
              <div className="text-center space-y-4">
                <AnimatePresence mode="wait">
                  <motion.h1
                    key={currentGreeting.text}
                    className="text-6xl md:text-8xl font-bold text-black tracking-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {currentGreeting.text}
                  </motion.h1>
                </AnimatePresence>
                
                <motion.div
                  className="text-gray-600 text-lg md:text-xl font-light"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {currentGreeting.lang}
                </motion.div>
              </div>

              {/* Loading indicator */}
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Loading...</span>
                  <span>100%</span>
                </div>
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 4.2, ease: "linear" }}
                  />
                </div>
              </div>

              {/* Skip hint */}
              <motion.div
                className="text-gray-500 text-sm font-light flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
                <span>Click anywhere to skip</span>
              </motion.div>
            </motion.div>

            {/* Skip zones */}
            <div
              className="absolute inset-0"
              style={{ pointerEvents: 'all', backgroundColor: 'rgba(255, 255, 255, 0)' }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                handleSkip();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                handleSkip();
              }}
              onTouchStart={(e: any) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                handleSkip();
              }}
            />
          </div>
          
          {/* CSS animation */}
          <style jsx>{`
            @keyframes softPulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.02); }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Custom cursor component
export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const cursorPosition = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  };

  const updateCursorPosition = (e: MouseEvent) => {
    mousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const animateCursor = () => {
    cursorPosition.current.x = lerp(cursorPosition.current.x, mousePosition.current.x, 0.15);
    cursorPosition.current.y = lerp(cursorPosition.current.y, mousePosition.current.y, 0.15);
    
    if (cursorRef.current) {
      cursorRef.current.style.left = `${cursorPosition.current.x}px`;
      cursorRef.current.style.top = `${cursorPosition.current.y}px`;
    }
    
    animationFrameRef.current = requestAnimationFrame(animateCursor);
  };

  useEffect(() => {
    document.addEventListener('mousemove', updateCursorPosition);
    
    animationFrameRef.current = requestAnimationFrame(animateCursor);
    
    // Check theme
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark') || 
                     !document.documentElement.classList.contains('light');
      setIsDarkTheme(isDark);
    };
    
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => {
      document.removeEventListener('mousemove', updateCursorPosition);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Add hover listeners to interactive elements
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [role="button"]');
    
    interactiveElements.forEach(element => {
      element.addEventListener('mouseenter', () => setIsHovering(true));
      element.addEventListener('mouseleave', () => setIsHovering(false));
    });
    
    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      
      interactiveElements.forEach(element => {
        element.removeEventListener('mouseenter', () => setIsHovering(true));
        element.removeEventListener('mouseleave', () => setIsHovering(false));
      });
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className={cn(
        "fixed top-0 left-0 pointer-events-none z-[9999] transform -translate-x-1/2 -translate-y-1/2",
        "w-8 h-8 transition-all duration-100 ease-out",
        isVisible ? "opacity-100" : "opacity-0",
        isHovering ? "w-16 h-16 bg-black/10 backdrop-blur-xl border border-black/30" : "w-8 h-8 bg-black/5 border border-black/10",
        isClicking ? "scale-75" : "scale-100"
      )}
      style={{
        transition: 'width 0.2s ease, height 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, transform 0.1s ease, opacity 0.2s ease'
      }}
    >
      {isHovering ? (
        <div className="absolute inset-0 rounded-full bg-black/5 animate-pulse" />
      ) : (
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20" />
      )}
      <div className="absolute inset-0 rounded-full border-black/20" />
      <div className="absolute inset-0 rounded-full bg-black/5" />
      
      {/* Cursor dot */}
      <div 
        className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-black/80"
        style={{ transform: 'translate(-50%, -50%)' }}
      />
    </div>
  );
}