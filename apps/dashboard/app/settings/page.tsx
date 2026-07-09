"use client";

import { useAuth } from "@tirbeo/auth";
import { appUrl } from "@tirbeo/utils";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";

const stagger = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
});

function SettingCard({ title, desc, action, glow = "orange" }: { title: string; desc: string; action: React.ReactNode; glow?: string }) {
  const glowClass = glow === "purple" ? "glow-orb-purple" : glow === "blue" ? "glow-orb-blue" : "glow-orb-orange";
  return (
    <motion.div className="glass rounded-2xl p-6 relative overflow-hidden">
      <div className={`${glowClass} w-32 h-32 -top-16 -right-16 opacity-50`} />
      <div className="relative z-10">
        <h3 className="text-sm font-semibold text-[#CBD5E1]">{title}</h3>
        <p className="text-xs text-[#94A3B8] mt-1 mb-4 leading-relaxed">{desc}</p>
        {action}
      </div>
    </motion.div>
  );
}

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (!user && !isLoading && typeof window !== "undefined") {
      window.location.href = appUrl("accounts", "/login?redirect=" + encodeURIComponent(window.location.href));
    }
  }, [user, isLoading]);

  if (isLoading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#F25604]/20 border-t-[#F97316] rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen relative">
      <div className="glow-orb-orange w-[25%] h-[25%] top-[-5%] right-[-5%]" />
      <div className="glow-orb-blue w-[20%] h-[20%] bottom-[-5%] left-[-5%]" />

      <nav className="nav-glass sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-sm tracking-widest uppercase text-[#CBD5E1] hover:text-[#EAF3F3] transition-colors">
            &larr; Dashboard
          </Link>
          <span className="text-xs text-[#94A3B8]">Settings</span>
        </div>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div {...stagger(0.15)} className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            <span className="gradient-text-purple">Settings</span>
          </h1>
          <p className="text-sm text-[#94A3B8] mt-2">Manage your account preferences and configuration</p>
        </motion.div>

        <div className="space-y-4">
          <motion.div {...stagger(0.3)}>
            <SettingCard
              title="Notifications"
              desc="Receive email notifications for account activity, messages, and updates"
              glow="orange"
              action={
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={() => setNotifications(!notifications)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-white/[0.1] rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-[#F25604] peer-checked:to-[#F97316] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                </label>
              }
            />
          </motion.div>

          <motion.div {...stagger(0.4)}>
            <SettingCard
              title="Theme"
              desc="Toggle between dark and light mode (dark mode is recommended for the best experience)"
              glow="purple"
              action={
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={() => setDarkMode(!darkMode)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-white/[0.1] rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-[#7A3EF2] peer-checked:to-[#2F4FC4] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                </label>
              }
            />
          </motion.div>

          <motion.div {...stagger(0.5)}>
            <SettingCard
              title="Account Security"
              desc="Manage your password, two-factor authentication, and active sessions"
              glow="blue"
              action={
                <span className="text-xs text-[#94A3B8]">Coming soon</span>
              }
            />
          </motion.div>

          <motion.div {...stagger(0.6)}>
            <SettingCard
              title="Connected Services"
              desc="Manage connected apps and third-party integrations"
              glow="orange"
              action={
                <span className="text-xs text-[#94A3B8]">Coming soon</span>
              }
            />
          </motion.div>
        </div>

        {/* Danger Zone */}
        <motion.div {...stagger(0.7)} className="glass rounded-2xl p-6 mt-8 border border-red-500/20">
          <h3 className="text-sm font-semibold text-red-400">Danger Zone</h3>
          <p className="text-xs text-[#94A3B8] mt-1 mb-4">Irreversible actions for your account</p>
          <button className="px-4 py-2 text-xs font-medium text-red-400 border border-red-500/30 rounded-full hover:bg-red-500/10 transition-colors">
            Delete Account
          </button>
        </motion.div>
      </div>
    </main>
  );
}
