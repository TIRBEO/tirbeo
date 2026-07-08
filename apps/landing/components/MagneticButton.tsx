'use client';
import { useRef, useState, useCallback } from 'react';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  strength?: number;
  padding?: number;
}

export function MagneticButton({ children, className = '', href, onClick, strength = 3, padding = 80 }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouse = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > padding) {
      setPos({ x: 0, y: 0 });
      return;
    }
    setPos({ x: dx / strength, y: dy / strength });
  }, [strength, padding]);

  const handleLeave = useCallback(() => setPos({ x: 0, y: 0 }), []);

  const style = {
    transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
    transition: pos.x === 0 && pos.y === 0 ? 'transform 0.6s ease-in-out' : 'transform 0.15s ease-out',
    willChange: 'transform' as const,
  };

  const commonProps = {
    ref: ref as any,
    className,
    style,
    onMouseMove: handleMouse,
    onMouseLeave: handleLeave,
  };

  if (href) {
    return <a {...commonProps} href={href}>{children}</a>;
  }
  return <button {...commonProps} onClick={onClick} type="button">{children}</button>;
}

export function MagneticImage({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouse = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setPos({
      x: (e.clientX - cx) / 8,
      y: (e.clientY - cy) / 8,
    });
  }, []);

  const handleLeave = useCallback(() => setPos({ x: 0, y: 0 }), []);

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        transition: pos.x === 0 && pos.y === 0 ? 'transform 0.6s ease-in-out' : 'transform 0.1s ease-out',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}
