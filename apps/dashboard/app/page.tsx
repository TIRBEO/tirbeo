"use client";

import { useAuth } from "@tirbeo/auth";
import { appUrl } from "@tirbeo/utils";

export default function DashboardPage() {
  const { user, profile, admin, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-tirbeo-dark-500">Loading...</p>
      </main>
    );
  }

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = appUrl("accounts", "/login?redirect=" + encodeURIComponent(window.location.href));
    }
    return null;
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-tirbeo-dark-950">
          My Account
        </h1>
        <button
          onClick={signOut}
          className="rounded-md border border-tirbeo-dark-300 px-4 py-2 text-sm text-tirbeo-dark-700 transition-colors hover:bg-tirbeo-dark-50"
        >
          Sign Out
        </button>
      </div>

      <div className="mt-8 space-y-6">
        <section className="rounded-xl border border-tirbeo-dark-200 bg-white p-6">
          <h2 className="font-heading text-lg font-semibold">Profile</h2>
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-tirbeo-dark-400">Username</label>
              <p className="text-sm text-tirbeo-dark-900">{profile?.username || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-tirbeo-dark-400">Full Name</label>
              <p className="text-sm text-tirbeo-dark-900">{profile?.full_name || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-tirbeo-dark-400">Email</label>
              <p className="text-sm text-tirbeo-dark-900">{user?.email || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-tirbeo-dark-400">Bio</label>
              <p className="text-sm text-tirbeo-dark-900">{profile?.bio || "—"}</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-tirbeo-dark-200 bg-white p-6">
          <h2 className="font-heading text-lg font-semibold">Account</h2>
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-tirbeo-dark-400">Karma Points</label>
              <p className="text-sm text-tirbeo-dark-900">{profile?.karma_points ?? 0}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-tirbeo-dark-400">Verified</label>
              <p className="text-sm text-tirbeo-dark-900">{profile?.is_verified ? "Yes" : "No"}</p>
            </div>
            {admin && (
              <div>
                <label className="text-xs font-medium text-tirbeo-dark-400">Admin Role</label>
                <p className="text-sm font-medium text-tirbeo-gold-600">{admin.role}</p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-tirbeo-dark-200 bg-white p-6">
          <h2 className="font-heading text-lg font-semibold">Services</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { name: "Chat", url: appUrl("chat"), desc: "Direct messages" },
              { name: "Admin Panel", url: appUrl("admin"), desc: admin ? "Manage platform" : "Staff only" },
              { name: "Support", url: appUrl("support"), desc: "Get help" },
              { name: "Tirbeo.com", url: appUrl("www"), desc: "Company site" },
            ].map((service) => (
              <a
                key={service.name}
                href={service.url}
                className="rounded-lg border border-tirbeo-dark-200 p-4 transition-colors hover:border-tirbeo-crimson-200"
              >
                <p className="font-medium text-tirbeo-dark-950">{service.name}</p>
                <p className="mt-1 text-xs text-tirbeo-dark-500">{service.desc}</p>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
