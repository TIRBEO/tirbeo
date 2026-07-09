"use client";

import { useAuth } from "@tirbeo/auth";
import { appUrl } from "@tirbeo/utils";
import { useState, useEffect } from "react";

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-xs font-medium text-[#7B7E84] uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-semibold mt-1 ${accent ? "text-[#D8B36A]" : "text-[#F2EEE8]"}`}>{value}</p>
    </div>
  );
}

function ServiceCard({ name, url, desc }: { name: string; url: string; desc: string }) {
  return (
    <a href={url} className="glass rounded-2xl p-5 hover:bg-[rgba(28,31,35,0.7)] transition-all duration-500 group block">
      <p className="font-semibold text-[#F2EEE8] group-hover:text-[#D8B36A] transition-colors">{name}</p>
      <p className="mt-1 text-xs text-[#7B7E84]">{desc}</p>
    </a>
  );
}

export default function DashboardPage() {
  const { user, profile, admin, isLoading, signOut } = useAuth();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user && !isLoading && typeof window !== "undefined") {
      window.location.href = appUrl("accounts", "/login?redirect=" + encodeURIComponent(window.location.href));
    }
  }, [user, isLoading]);

  const copyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#D8B36A]/20 border-t-[#D8B36A] rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Background glow */}
      <div className="fixed top-[-20%] left-[-10%] w-[40%] h-[40%] bg-[#D8B36A]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-[#5F7352]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F2EEE8]">
              {profile?.username ? `${profile.username}'s Account` : "My Account"}
            </h1>
            <p className="text-sm text-[#7B7E84] mt-1">Manage your Tirbeo profile and settings</p>
          </div>
          <button onClick={signOut} className="btn-ghost text-sm">
            Sign Out
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Karma" value={profile?.karma_points ?? 0} accent />
          <StatCard label="Status" value={profile?.is_verified ? "Verified" : "Unverified"} />
          <StatCard label="Role" value={admin?.role || "Member"} accent={!!admin} />
          <StatCard label="District" value={profile?.district_id || "—"} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Section */}
          <section className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D8B36A]" />
              Profile
            </h2>
            <div className="mt-5 space-y-4">
              {[
                ["Username", profile?.username || "—"],
                ["Full Name", profile?.full_name || "—"],
                ["Email", user?.email || "—"],
                ["Bio", profile?.bio || "—"],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <label className="text-xs font-medium text-[#7B7E84] uppercase tracking-wider">{label as string}</label>
                  <p className="text-sm text-[#F2EEE8] mt-0.5">{value as string}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Account Section */}
          <section className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5F7352]" />
              Account
            </h2>
            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-[#7B7E84] uppercase tracking-wider">User ID</label>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-sm text-[#F2EEE8] font-mono truncate">{user?.id}</p>
                  <button onClick={copyId} className="text-[#7B7E84] hover:text-[#D8B36A] transition-colors text-xs shrink-0">
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[#7B7E84] uppercase tracking-wider">Joined</label>
                <p className="text-sm text-[#F2EEE8] mt-0.5">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}
                </p>
              </div>
              {admin && (
                <div className="bg-[#D8B36A]/10 border border-[#D8B36A]/20 rounded-xl px-4 py-3">
                  <p className="text-xs font-medium text-[#D8B36A] uppercase tracking-wider">Admin Access</p>
                  <p className="text-sm text-[#F2EEE8] mt-0.5 capitalize">{admin.role}</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Services */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold tracking-tight mb-5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D8B36A]" />
            Services
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ServiceCard name="Chat" url={appUrl("chat")} desc="Direct messages & real-time chat" />
            <ServiceCard name="Admin Panel" url={appUrl("admin")} desc={admin ? "Manage platform" : "Staff only"} />
            <ServiceCard name="Support" url={appUrl("support")} desc="Get help & contact us" />
            <ServiceCard name="Tirbeo" url={appUrl("www")} desc="Company site & info" />
          </div>
        </section>
      </div>
    </main>
  );
}
