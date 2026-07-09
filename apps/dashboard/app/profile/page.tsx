"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api-tirbeo.vercel.app";

type ProfileUser = {
  id: string;
  email: string;
  name: string | null;
  photoUrl: string | null;
  secondaryEmail: string | null;
  phoneNumber: string | null;
  occupation: string | null;
};

function GlowOrb({ className }: { className: string }) {
  return <div className={`absolute rounded-full blur-[120px] pointer-events-none ${className}`} />;
}

export default function ProfilePage() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [occupation, setOccupation] = useState("");
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetch(`${API}/api/users/me`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ProfileUser | null) => {
        if (!data) {
          window.location.href = `https://accounts.tirbeo.app/login?redirect=${encodeURIComponent(window.location.href)}`;
          return;
        }
        setUser(data);
        setName(data.name || "");
        setOccupation(data.occupation || "");
      })
      .catch(() => {
        window.location.href = `https://accounts.tirbeo.app/login?redirect=${encodeURIComponent(window.location.href)}`;
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`${API}/api/users/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: name.trim(), occupation: occupation.trim() }),
      });
      if (!res.ok) { setError(await res.text() || "Save failed"); return; }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Connection error");
    } finally {
      setSaving(false);
    }
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
            <Link href="/profile" className="px-4 py-2 rounded-full text-sm font-medium bg-[#F25604]/20 text-[#F97316] glow-orange">Profile</Link>
            <Link href="/settings" className="px-4 py-2 rounded-full text-sm font-medium text-[#CBD5E1] hover:text-[#EAF3F3] hover:bg-white/5 transition-all">Settings</Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="mb-8">
          <Link href="/" className="text-xs text-[#94A3B8] hover:text-[#F97316] transition-colors">&larr; Back to Dashboard</Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-3">
            <span className="gradient-text">Edit Profile</span>
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">Update your personal information</p>
        </motion.div>

        <motion.form
          onSubmit={handleSave}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="glass rounded-2xl p-6 sm:p-7 space-y-6"
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider block mb-2">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-[rgba(255,255,255,0.05)] border border-white/[0.08] rounded-xl h-11 px-4 text-[#EAF3F3] placeholder:text-[#94A3B8]/50 outline-none focus:border-[#F97316]/50 focus:ring-1 focus:ring-[#F97316]/20 transition-all text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider block mb-2">Occupation</label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="What do you do?"
                className="w-full bg-[rgba(255,255,255,0.05)] border border-white/[0.08] rounded-xl h-11 px-4 text-[#EAF3F3] placeholder:text-[#94A3B8]/50 outline-none focus:border-[#F97316]/50 focus:ring-1 focus:ring-[#F97316]/20 transition-all text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider block mb-2">Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full bg-[rgba(255,255,255,0.02)] border border-white/[0.05] rounded-xl h-11 px-4 text-[#94A3B8] text-sm cursor-not-allowed"
              />
            </div>
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</motion.p>
          )}
          {success && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-green-400 bg-green-400/10 rounded-lg px-3 py-2">Profile updated successfully!</motion.p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 h-11 bg-gradient-to-r from-[#F25604] to-[#F97316] text-white font-medium rounded-xl hover:opacity-90 active:scale-[0.98] transition-all duration-200 glow-orange disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link href="/" className="px-6 h-11 flex items-center text-sm font-medium text-[#94A3B8] hover:text-[#EAF3F3] transition-colors rounded-xl hover:bg-white/5">Cancel</Link>
          </div>
        </motion.form>
      </div>
    </main>
  );
}
