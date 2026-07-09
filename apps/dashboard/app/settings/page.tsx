"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type SettingsUser = {
  id: string;
  email: string;
  name: string | null;
};

function GlowOrb({ className }: { className: string }) {
  return <div className={`absolute rounded-full blur-[120px] pointer-events-none ${className}`} />;
}

export default function SettingsPage() {
  const [user, setUser] = useState<SettingsUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetch(`${API}/api/users/me`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: SettingsUser | null) => {
        if (!data) {
          window.location.href = `https://accounts.tirbeo.app/login?redirect=${encodeURIComponent(window.location.href)}`;
          return;
        }
        setUser(data);
      })
      .catch(() => {
        window.location.href = `https://accounts.tirbeo.app/login?redirect=${encodeURIComponent(window.location.href)}`;
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = () => {
    setNotifications(!notifications);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black">
        <GlowOrb className="w-[40%] h-[40%] top-[-10%] left-[-10%] bg-[#0A2472]/30" />
        <div className="relative z-10 w-6 h-6 border-2 border-[#F25604]/20 border-t-[#F97316] rounded-full animate-spin" />
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-black relative overflow-hidden">
      <div className="fixed inset-0 bg-mesh opacity-80 pointer-events-none" />
      <GlowOrb className="w-[35%] h-[35%] top-[-10%] right-[-10%] bg-[#7A3EF2]/15" />
      <GlowOrb className="w-[30%] h-[30%] bottom-[-10%] left-[-5%] bg-[#F25604]/10" />

      <nav className="sticky top-0 z-50 bg-[rgba(1,0,6,0.8)] backdrop-blur-[20px] border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="font-bold text-sm tracking-widest uppercase shimmer">Dashboard</span>
          <div className="flex items-center gap-2">
            <Link href="/" className="px-4 py-2 rounded-full text-sm font-medium text-[#CBD5E1] hover:text-[#EAF3F3] hover:bg-white/5 transition-all">Home</Link>
            <Link href="/profile" className="px-4 py-2 rounded-full text-sm font-medium text-[#CBD5E1] hover:text-[#EAF3F3] hover:bg-white/5 transition-all">Profile</Link>
            <Link href="/settings" className="px-4 py-2 rounded-full text-sm font-medium bg-[#F25604]/20 text-[#F97316] glow-orange">Settings</Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="mb-8">
          <Link href="/" className="text-xs text-[#94A3B8] hover:text-[#F97316] transition-colors">&larr; Back to Dashboard</Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-3">
            <span className="gradient-text">Settings</span>
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">Manage your preferences</p>
        </motion.div>

        <div className="grid gap-6">
          {/* Notifications */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="glass rounded-2xl p-6 sm:p-7"
          >
            <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#7A3EF2] glow-purple" />
              Notifications
            </h2>
            <p className="text-sm text-[#94A3B8] mb-6">Control how you receive updates and alerts.</p>

            <div className="flex items-center justify-between py-3 border-b border-white/[0.06]">
              <div>
                <p className="text-sm font-medium text-[#EAF3F3]">Email notifications</p>
                <p className="text-xs text-[#94A3B8] mt-0.5">Receive updates via email</p>
              </div>
              <button
                onClick={handleToggle}
                className={`relative w-11 h-6 rounded-full transition-all duration-300 ${notifications ? "bg-[#F97316]" : "bg-white/10"}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-md ${notifications ? "left-6" : "left-1"}`} />
              </button>
            </div>

            {saved && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-green-400 mt-3">Preference saved.</motion.p>
            )}
          </motion.section>

          {/* Account info */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
            className="glass rounded-2xl p-6 sm:p-7"
          >
            <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#F97316] glow-orange" />
              Account
            </h2>
            <p className="text-sm text-[#94A3B8] mb-6">Your login and account details.</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2.5 border-b border-white/[0.06]">
                <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Email</span>
                <span className="text-sm text-[#EAF3F3]">{user.email}</span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-white/[0.06]">
                <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Name</span>
                <span className="text-sm text-[#EAF3F3]">{user.name || "Not set"}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/[0.06]">
              <Link href="/profile" className="inline-flex items-center gap-2 px-5 h-10 bg-gradient-to-r from-[#F25604] to-[#F97316] text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all glow-orange">
                Edit Profile
              </Link>
            </div>
          </motion.section>

          {/* Danger zone */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
            className="glass rounded-2xl p-6 sm:p-7 border-red-500/20"
            style={{ background: 'rgba(255,50,50,0.03)', border: '1px solid rgba(255,50,50,0.15)' }}
          >
            <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2.5 mb-2 text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              Danger Zone
            </h2>
            <p className="text-sm text-[#94A3B8] mb-6">Irreversible actions. Proceed with caution.</p>

            <button className="px-5 h-10 bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium rounded-xl hover:bg-red-500/20 transition-all">
              Delete Account
            </button>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
