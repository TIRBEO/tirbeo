"use client";

import { useAuth } from "@tirbeo/auth";

export default function AdminDashboard() {
  const { profile, admin, signOut } = useAuth();

  return (
    <main className="flex min-h-screen flex-col p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-tirbeo-crimson-600">
          Admin Dashboard
        </h1>
        <button
          onClick={signOut}
          className="rounded-md bg-tirbeo-crimson-600 px-4 py-2 text-sm text-white hover:bg-tirbeo-crimson-700"
        >
          Sign Out
        </button>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-4">
        <a href="/settings/domains" className="block rounded-xl border border-tirbeo-dark-200 bg-white p-6 shadow-sm transition hover:border-tirbeo-crimson-300">
          <h2 className="font-heading text-lg font-semibold">Domains</h2>
          <p className="mt-2 text-sm text-tirbeo-dark-500">Configure subdomain routing</p>
        </a>
        <div className="rounded-xl border border-tirbeo-dark-200 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-lg font-semibold">Users</h2>
          <p className="mt-2 text-sm text-tirbeo-dark-500">Manage user profiles</p>
        </div>
        <div className="rounded-xl border border-tirbeo-dark-200 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-lg font-semibold">Content</h2>
          <p className="mt-2 text-sm text-tirbeo-dark-500">Moderate posts and comments</p>
        </div>
        <div className="rounded-xl border border-tirbeo-dark-200 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-lg font-semibold">Audit Logs</h2>
          <p className="mt-2 text-sm text-tirbeo-dark-500">System activity tracking</p>
        </div>
      </div>

      {profile && (
        <div className="mt-8 rounded-xl border border-tirbeo-dark-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-tirbeo-dark-500">
            Logged in as <strong>{profile.username}</strong>
            {admin && (
              <span className="ml-2 rounded-md bg-tirbeo-gold-500 px-2 py-0.5 text-xs text-white">
                {admin.role}
              </span>
            )}
          </p>
        </div>
      )}
    </main>
  );
}
