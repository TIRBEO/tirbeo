"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

function StatCard({ label, value, accent, icon }: { label: string; value: string | number; accent?: boolean; icon?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass rounded-2xl p-5 glow-border"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">{label}</p>
        {icon && <span className={`text-lg ${accent ? "text-[#F97316]" : "text-[#7A3EF2]"}`}>{icon}</span>}
      </div>
      <p className={`text-2xl sm:text-3xl font-bold tracking-tight ${accent ? "gradient-text" : "text-[#EAF3F3]"}`}>
        {value}
      </p>
    </motion.div>
  );
}

function ServiceCard({ name, url, desc, color }: { name: string; url: string; desc: string; color?: string }) {
  return (
    <motion.a
      href={url}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="glass rounded-2xl p-5 hover:bg-[rgba(255,255,255,0.06)] transition-all duration-500 group block"
    >
      <p className="font-semibold text-[#EAF3F3] group-hover:text-[#F97316] transition-colors duration-300">{name}</p>
      <p className="mt-1.5 text-xs text-[#94A3B8] leading-relaxed">{desc}</p>
      <span className="inline-block mt-3 text-xs font-medium group-hover:translate-x-1 transition-all duration-300" style={{ color: color || '#F97316' }}>
        Open &rarr;
      </span>
    </motion.a>
  );
}

function InfoRow({ label, value, glow }: { label: string; value: string; glow?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center justify-between py-2.5 border-b border-white/[0.06] last:border-0 ${glow ? "glow-orange rounded-lg px-2 -mx-2" : ""}`}
    >
      <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">{label}</span>
      <span className="text-sm text-[#EAF3F3] font-medium">{value}</span>
    </motion.div>
  );
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

  if (loading) {
    return (
      <main className="noise-overlay flex min-h-screen items-center justify-center bg-black">
        <GlowOrb className="w-[40%] h-[40%] top-[-10%] left-[-10%] bg-[#0A2472]/30" />
        <div className="relative z-10 w-6 h-6 border-2 border-[#F25604]/20 border-t-[#F97316] rounded-full animate-spin" />
      </main>
    );
  }

  if (!user) return null;

  const role = user.adminRole ? user.adminRole.charAt(0).toUpperCase() + user.adminRole.slice(1) : "Member";

  return (
    <main className="noise-overlay min-h-screen bg-black relative overflow-hidden">
      {/* Gradient mesh background */}
      <div className="fixed inset-0 bg-mesh opacity-80 pointer-events-none" />

      {/* Glow orbs */}
      <GlowOrb className="w-[35%] h-[35%] top-[-10%] right-[-10%] bg-[#7A3EF2]/15" />
      <GlowOrb className="w-[30%] h-[30%] bottom-[-10%] left-[-5%] bg-[#F25604]/10" />
      <GlowOrb className="w-[25%] h-[25%] top-[40%] left-[40%] bg-[#0A2472]/20" />

      {/* Frosted glass nav */}
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="mb-10"
        >
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {user.name ? (
              <>
                <span className="text-[#EAF3F3]">{user.name.split(" ")[0]}&apos;s </span>
                <span className="gradient-text">Account</span>
              </>
            ) : (
              <span className="gradient-text">My Account</span>
            )}
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">Manage your Tirbeo profile and settings</p>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <StatCard label="Karma" value={0} accent icon="✦" />
          <StatCard label="Status" value="Active" />
          <StatCard label="Role" value={role} accent={!!user.adminRole} />
          <StatCard label="Email" value={user.email} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Profile section */}
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
              <InfoRow label="Name" value={user.name || "Not set"} />
              <InfoRow label="Email" value={user.email} glow />
              <InfoRow label="Occupation" value="—" />
              <InfoRow label="Phone" value="—" />
            </div>
          </motion.section>

          {/* Account section */}
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
              <InfoRow label="Joined" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"} />
              {user.adminRole && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
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

        {/* Services */}
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
            <ServiceCard name="Chat" url="https://chat.tirbeo.app" desc="Direct messages & real-time chat" color="#7A3EF2" />
            <ServiceCard name="Admin" url="https://admin.tirbeo.app" desc={user.adminRole ? "Manage platform" : "Staff only"} color="#F97316" />
            <ServiceCard name="Support" url="https://support.tirbeo.app" desc="Get help & contact us" color="#2F4FC4" />
            <ServiceCard name="Tirbeo" url="https://tirbeo.app" desc="Company site & info" color="#F97316" />
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-16 pt-8 border-t border-white/[0.06] text-center"
        >
          <p className="text-xs text-[#94A3B8]">&copy; {new Date().getFullYear()} Tirbeo. All rights reserved.</p>
        </motion.footer>
      </div>
    </main>
  );
}
