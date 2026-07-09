"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "motion/react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type DashboardUser = {
  id: string;
  email: string;
  name: string | null;
  photoUrl: string | null;
  adminRole: string | null;
  createdAt: string;
};

function GlowOrb({ className }: { className: string }) {
  return <div className={`absolute rounded-full blur-[120px] pointer-events-none ${className}`} />;
}

function useCounter(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [end, duration]);

  return count;
}

function StatCard({ label, value, accent, icon }: { label: string; value: string | number; accent?: boolean; icon?: string }) {
  const numeric = typeof value === 'number';
  const counter = numeric ? useCounter(value as number) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass rounded-2xl p-5 glow-border hover:scale-[1.02] transition-transform duration-300"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">{label}</p>
        {icon && <span className={`text-lg ${accent ? "text-[#F97316]" : "text-[#7A3EF2]"}`}>{icon}</span>}
      </div>
      <p className={`text-2xl sm:text-3xl font-bold tracking-tight ${accent ? "gradient-text" : "text-[#EAF3F3]"}`}>
        {numeric ? counter : value}
      </p>
    </motion.div>
  );
}

const gradientStyles = [
  { bg: 'from-purple-500/10 via-transparent to-transparent' },
  { bg: 'from-orange-500/10 via-transparent to-transparent' },
  { bg: 'from-blue-500/10 via-transparent to-transparent' },
  { bg: 'from-pink-500/10 via-transparent to-transparent' },
];

function ServiceCard({ name, url, desc, color, index }: { name: string; url: string; desc: string; color?: string; index: number }) {
  const cardRef = useRef<HTMLAnchorElement>(null);

  return (
    <motion.a
      ref={cardRef}
      href={url}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="glass rounded-2xl p-5 hover:bg-[rgba(255,255,255,0.08)] transition-all duration-500 group block"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientStyles[index % gradientStyles.length].bg} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
      <p className="font-semibold text-[#EAF3F3] group-hover:text-[#F97316] transition-colors duration-300 relative">
        {name}
        <span className="inline-block ml-1.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
          &rarr;
        </span>
      </p>
      <p className="mt-1.5 text-xs text-[#94A3B8] leading-relaxed relative">{desc}</p>
    </motion.a>
  );
}

function TypewriterText({ text, className = "" }: { text: string; className?: string }) {
  const [displayed, setDisplayed] = useState("");
  const i = useRef(0);

  useEffect(() => {
    if (i.current >= text.length) return;
    const interval = setInterval(() => {
      i.current++;
      setDisplayed(text.slice(0, i.current));
      if (i.current >= text.length) clearInterval(interval);
    }, 35);
    return () => clearInterval(interval);
  }, [text]);

  return <span className={className}>{displayed}<span className="animate-pulse">|</span></span>;
}

function ParticleBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [];

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5, a: Math.random() * 0.3 + 0.1,
      });
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255,255,255,${p.a})`;
        ctx!.fill();
      });
      requestAnimationFrame(draw);
    }

    draw();

    const resize = () => { w = canvas!.width = window.innerWidth; h = canvas!.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

export default function DashboardPage() {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetch(`${API}/api/users/me`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setUser(data);
        else {
          const redirect = encodeURIComponent(window.location.href);
          window.location.href = `https://accounts.tirbeo.app/login?redirect=${redirect}`;
        }
      })
      .catch(() => {
        const redirect = encodeURIComponent(window.location.href);
        window.location.href = `https://accounts.tirbeo.app/login?redirect=${redirect}`;
      })
      .finally(() => setLoading(false));
  }, []);

  const copyId = useCallback(() => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [user]);

  const userName = useMemo(() => user?.name?.split(" ")[0] || "there", [user]);

  if (loading) {
    return (
      <main className="noise-overlay flex min-h-screen items-center justify-center bg-black">
        <GlowOrb className="w-[40%] h-[40%] top-[-10%] left-[-10%] bg-[#0A2472]/30" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#F25604]/20 border-t-[#F97316] rounded-full animate-spin" />
          <p className="text-xs text-[#94A3B8] animate-pulse">Loading your dashboard...</p>
        </div>
      </main>
    );
  }

  if (!user) return null;

  const role = user.adminRole ? user.adminRole.charAt(0).toUpperCase() + user.adminRole.slice(1) : "Member";

  return (
    <main className="noise-overlay min-h-screen bg-black relative overflow-hidden">
      <div className="fixed inset-0 bg-mesh opacity-80 pointer-events-none" />
      <ParticleBg />

      <GlowOrb className="w-[35%] h-[35%] top-[-10%] right-[-10%] bg-[#7A3EF2]/15" />
      <GlowOrb className="w-[30%] h-[30%] bottom-[-10%] left-[-5%] bg-[#F25604]/10" />
      <GlowOrb className="w-[25%] h-[25%] top-[40%] left-[40%] bg-[#0A2472]/20" />

      <nav className="sticky top-0 z-50 bg-[rgba(1,0,6,0.8)] backdrop-blur-[20px] border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="font-bold text-sm tracking-widest uppercase shimmer">Dashboard</span>
          <div className="flex items-center gap-2">
            <Link href="/" className="px-4 py-2 rounded-full text-sm font-medium bg-[#F25604]/20 text-[#F97316] glow-orange">Home</Link>
            <Link href="/profile" className="px-4 py-2 rounded-full text-sm font-medium text-[#CBD5E1] hover:text-[#EAF3F3] hover:bg-white/5 transition-all">Profile</Link>
            <Link href="/settings" className="px-4 py-2 rounded-full text-sm font-medium text-[#CBD5E1] hover:text-[#EAF3F3] hover:bg-white/5 transition-all">Settings</Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="mb-10"
        >
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight min-h-[2.5rem]">
            <TypewriterText text={`Welcome back, ${userName}.`} className="gradient-text" />
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">Manage your Tirbeo profile and settings</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <StatCard label="Karma" value={0} accent icon="✦" />
          <StatCard label="Status" value="Active" />
          <StatCard label="Role" value={role} accent={!!user.adminRole} />
          <StatCard label="Email" value={user.email} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="glass rounded-2xl p-6 sm:p-7"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#F97316] glow-orange" />
                Profile
              </h2>
              <Link href="/profile" className="text-xs font-medium text-[#F97316] hover:text-[#F25604] transition-colors">
                Edit &rarr;
              </Link>
            </div>
            <div className="space-y-1">
              <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-between py-2.5 border-b border-white/[0.06] last:border-0">
                <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Name</span>
                <span className="text-sm text-[#EAF3F3] font-medium">{user.name || "Not set"}</span>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-between py-2.5 border-b border-white/[0.06] last:border-0 glow-orange rounded-lg px-2 -mx-2">
                <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Email</span>
                <span className="text-sm text-[#EAF3F3] font-medium">{user.email}</span>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-between py-2.5 border-b border-white/[0.06] last:border-0">
                <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Occupation</span>
                <span className="text-sm text-[#EAF3F3] font-medium">&mdash;</span>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-between py-2.5 border-b border-white/[0.06] last:border-0">
                <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Phone</span>
                <span className="text-sm text-[#EAF3F3] font-medium">&mdash;</span>
              </motion.div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            className="glass rounded-2xl p-6 sm:p-7"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#7A3EF2] glow-purple" />
                Account
              </h2>
              <Link href="/settings" className="text-xs font-medium text-[#F97316] hover:text-[#F25604] transition-colors">
                Manage &rarr;
              </Link>
            </div>
            <div className="space-y-1">
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-between py-2.5 border-b border-white/[0.06]"
              >
                <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">User ID</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#EAF3F3] font-mono">{user.id.slice(0, 12)}...</span>
                  <button onClick={copyId} className="text-[#94A3B8] hover:text-[#F97316] transition-colors text-xs font-medium">
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-between py-2.5 border-b border-white/[0.06]"
              >
                <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Joined</span>
                <span className="text-sm text-[#EAF3F3] font-medium">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                </span>
              </motion.div>
              {user.adminRole && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-3 glow-border rounded-xl px-4 py-3"
                  style={{ background: 'rgba(122,62,242,0.08)', border: '1px solid rgba(122,62,242,0.2)' }}
                >
                  <p className="text-xs font-medium text-[#7A3EF2] uppercase tracking-wider">Admin Access</p>
                  <p className="text-sm text-[#EAF3F3] mt-0.5 capitalize">{user.adminRole}</p>
                </motion.div>
              )}
            </div>
          </motion.section>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
          className="mt-10"
        >
          <h2 className="text-lg font-semibold tracking-tight mb-5 flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#F97316] glow-orange" />
            Services
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ServiceCard name="Chat" url="https://chat.tirbeo.app" desc="Direct messages & real-time chat" color="#7A3EF2" index={0} />
            <ServiceCard name="Admin" url="https://admin.tirbeo.app" desc={user.adminRole ? "Manage platform" : "Staff only"} color="#F97316" index={1} />
            <ServiceCard name="Support" url="https://support.tirbeo.app" desc="Get help & contact us" color="#2F4FC4" index={2} />
            <ServiceCard name="Tirbeo" url="https://tirbeo.app" desc="Company site & info" color="#F97316" index={3} />
          </div>
        </motion.section>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 pt-8 border-t border-white/[0.06] text-center"
        >
          <p className="text-xs text-[#94A3B8]">&copy; {new Date().getFullYear()} Tirbeo. All rights reserved.</p>
        </motion.footer>
      </div>
    </main>
  );
}
