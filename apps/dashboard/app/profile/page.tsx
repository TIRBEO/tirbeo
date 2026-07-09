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

export default function ProfilePage() {
  const { user, profile, isLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user && !isLoading && typeof window !== "undefined") {
      window.location.href = appUrl("accounts", "/login?redirect=" + encodeURIComponent(window.location.href));
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setFullName(profile.full_name || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (isLoading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#F25604]/20 border-t-[#F97316] rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen relative">
      <div className="glow-orb-orange w-[30%] h-[30%] top-[-5%] left-[-5%]" />
      <div className="glow-orb-purple w-[25%] h-[25%] bottom-[-5%] right-[-5%]" />

      <nav className="nav-glass sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-sm tracking-widest uppercase text-[#CBD5E1] hover:text-[#EAF3F3] transition-colors">
            &larr; Dashboard
          </Link>
          <span className="text-xs text-[#94A3B8]">Edit Profile</span>
        </div>
      </nav>

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div {...stagger(0.15)} className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Edit <span className="gradient-text">Profile</span>
          </h1>
          <p className="text-sm text-[#94A3B8] mt-2">Update your public profile information</p>
        </motion.div>

        <motion.div {...stagger(0.3)} className="glass rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-[#EAF3F3] placeholder-[#94A3B8] focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 transition-all"
              placeholder="Your username"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-[#EAF3F3] placeholder-[#94A3B8] focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 transition-all"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-[#EAF3F3] placeholder-[#94A3B8] focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 transition-all resize-none"
              placeholder="Tell us about yourself"
            />
            <p className="text-xs text-[#94A3B8] mt-1.5">{bio.length}/200 characters</p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button onClick={handleSave} className="btn-primary text-sm">
              {saved ? "Saved!" : "Save Changes"}
            </button>
            <Link href="/" className="btn-ghost text-sm">
              Cancel
            </Link>
          </div>
        </motion.div>

        <motion.div {...stagger(0.45)} className="glass-subtle rounded-2xl p-6 mt-6">
          <h3 className="text-sm font-semibold text-[#CBD5E1] mb-2">Profile Tips</h3>
          <ul className="space-y-1.5 text-xs text-[#94A3B8] leading-relaxed">
            <li>Your username is your unique handle across all Tirbeo services</li>
            <li>A short bio helps others learn about you</li>
            <li>Your full name is displayed publicly on your profile</li>
          </ul>
        </motion.div>
      </div>
    </main>
  );
}
