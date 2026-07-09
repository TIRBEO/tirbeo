"use client";

import { useAuth } from "@tirbeo/auth";
import { appUrl } from "@tirbeo/utils";
import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import Link from "next/link";

function useCountUp(end: number, duration = 1.5) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    if (counted.current) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
      else counted.current = true;
    };
    requestAnimationFrame(tick);
  }, [end, duration]);

  return value;
}

function StatCard({ label, value, accent = false, icon }: { label: string; value: string | number; accent?: boolean; icon?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">{label}</p>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      {typeof value === "number" ? (
        <p className={`text-2xl sm:text-3xl font-bold tracking-tight ${accent ? "gradient-text" : "text-[#EAF3F3]"}`}>
          <CountUp end={value} />
        </p>
      ) : (
        <p className={`text-2xl sm:text-3xl font-bold tracking-tight ${accent ? "gradient-text" : "text-[#EAF3F3]"}`}>
          {value}
        </p>
      )}
    </motion.div>
  );
}

function CountUp({ end }: { end: number }) {
  const count = useCountUp(end);
  return <span>{count.toLocaleString()}</span>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between py-2.5 border-b border-white/[0.06] last:border-0"
    >
      <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">{label}</span>
      <span className="text-sm text-[#CBD5E1] font-medium">{value}</span>
    </motion.div>
  );
}

function ServiceCard({ name, url, desc }: { name: string; url: string; desc: string }) {
  return (
    <motion.a
      href={url}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="glass rounded-2xl p-5 hover:bg-[rgba(255,255,255,0.08)] transition-all duration-500 group block"
    >
      <p className="font-semibold text-[#EAF3F3] group-hover:text-[#F97316] transition-colors">{name}</p>
      <p className="mt-1.5 text-xs text-[#94A3B8] leading-relaxed">{desc}</p>
      <span className="inline-block mt-3 text-xs text-[#F97316] opacity-0 group-hover:opacity-100 transition-opacity">
        Open &rarr;
      </span>
    </motion.a>
  );
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
        active
          ? "bg-white/10 text-[#EAF3F3]"
          : "text-[#94A3B8] hover:text-[#CBD5E1] hover:bg-white/5"
      }`}
    >
      {children}
    </Link>
  );
}

const stagger = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
});

export default function DashboardPage() {
  const { user, profile, admin, isLoading, signOut } = useAuth();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user && !isLoading && typeof window !== "undefined") {
      window.location.href = appUrl("accounts", "/login?redirect=" + encodeURIComponent(
        typeof window !== "undefined" ? window.location.href : appUrl("dashboard")
      ));
    }
  }, [user, isLoading]);

  const copyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center relative">
        <div className="glow-orb-orange w-64 h-64 top-1/4 left-1/3" />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-8 h-8 border-2 border-[#F25604]/20 border-t-[#F97316] rounded-full animate-spin" />
          <p className="text-sm text-[#94A3B8]">Loading your account...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center relative">
        <div className="glow-orb-orange w-96 h-96 top-1/4 left-1/2 -translate-x-1/2" />
        <p className="text-[#94A3B8] relative z-10">Redirecting to login...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative">
      {/* Glow orbs */}
      <div className="glow-orb-orange w-[35%] h-[35%] top-[-10%] left-[-10%]" />
      <div className="glow-orb-purple w-[30%] h-[30%] bottom-[-10%] right-[-10%]" />
      <div className="glow-orb-blue w-[25%] h-[25%] top-[40%] right-[20%]" />

      {/* Navigation */}
      <nav className="nav-glass sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <motion.span {...stagger(0)} className="font-bold text-sm tracking-widest uppercase text-[#CBD5E1]">
            Dashboard
          </motion.span>
          <motion.div {...stagger(0.1)} className="flex items-center gap-2">
            <NavLink href="/" active>Home</NavLink>
            <NavLink href="/profile">Profile</NavLink>
            <NavLink href="/settings">Settings</NavLink>
            <button onClick={signOut} className="btn-ghost text-xs px-3 py-1.5 ml-2">
              Sign Out
            </button>
          </motion.div>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <motion.div {...stagger(0.15)} className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {profile?.username ? (
              <>
                Welcome back,{" "}
                <span className="gradient-text">{profile.username}</span>
              </>
            ) : (
              "My Account"
            )}
          </h1>
          <p className="text-sm text-[#94A3B8] mt-2">Manage your Tirbeo profile, settings, and services</p>
        </motion.div>

        {/* Stat Cards */}
        <motion.div {...stagger(0.3)} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <StatCard label="Karma" value={profile?.karma_points ?? 0} accent icon="✦" />
          <StatCard label="Status" value={profile?.is_verified ? "Verified" : "Unverified"} />
          <StatCard label="Role" value={admin?.role ? admin.role.charAt(0).toUpperCase() + admin.role.slice(1) : "Member"} accent={!!admin} />
          <StatCard label="District" value={profile?.district_id?.toString() || "—"} icon="◎" />
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Profile Section */}
          <motion.section {...stagger(0.4)} className="glass rounded-2xl p-6 sm:p-7">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#F97316]" />
                Profile
              </h2>
              <Link href="/profile" className="text-xs text-[#94A3B8] hover:text-[#F97316] transition-colors">
                Edit &rarr;
              </Link>
            </div>
            <div className="space-y-1">
              <InfoRow label="Username" value={profile?.username || "—"} />
              <InfoRow label="Full Name" value={profile?.full_name || "Not set"} />
              <InfoRow label="Email" value={user?.email || "—"} />
              <InfoRow label="Bio" value={profile?.bio ? (profile.bio.length > 50 ? profile.bio.slice(0, 50) + "..." : profile.bio) : "No bio"} />
            </div>
          </motion.section>

          {/* Account Section */}
          <motion.section {...stagger(0.5)} className="glass rounded-2xl p-6 sm:p-7">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#7A3EF2]" />
                Account
              </h2>
              <Link href="/settings" className="text-xs text-[#94A3B8] hover:text-[#F97316] transition-colors">
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
                  <span className="text-sm text-[#CBD5E1] font-mono">{user?.id.slice(0, 12)}...</span>
                  <button onClick={copyId} className="text-[#94A3B8] hover:text-[#F97316] transition-colors text-xs font-medium">
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </motion.div>
              <InfoRow label="Joined" value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"} />
              <InfoRow label="Last Updated" value={profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"} />
              {admin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 bg-gradient-to-r from-[#F25604]/10 to-[#7A3EF2]/10 border border-[#F25604]/20 rounded-xl px-4 py-3"
                >
                  <p className="text-xs font-medium text-[#F97316] uppercase tracking-wider">Admin Access</p>
                  <p className="text-sm text-[#CBD5E1] mt-0.5 capitalize">{admin.role}</p>
                </motion.div>
              )}
            </div>
          </motion.section>
        </div>

        {/* Services */}
        <motion.section {...stagger(0.6)} className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight mb-5 flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#7A3EF2]" />
            Services
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ServiceCard name="Chat" url={appUrl("chat")} desc="Direct messages & real-time chat" />
            <ServiceCard name="Admin Panel" url={appUrl("admin")} desc={admin ? "Manage platform settings" : "Staff only"} />
            <ServiceCard name="Support" url={appUrl("support")} desc="Get help, report issues, contact us" />
            <ServiceCard name="Tirbeo" url={appUrl("www")} desc="Company site, news & information" />
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer {...stagger(0.7)} className="mt-16 pt-8 border-t border-white/[0.06] text-center">
          <p className="text-xs text-[#94A3B8]">
            &copy; {new Date().getFullYear()} Tirbeo. All rights reserved.
          </p>
        </motion.footer>
      </div>
    </main>
  );
}
