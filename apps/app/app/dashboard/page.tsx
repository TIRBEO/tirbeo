"use client";

import { useAuth } from "@tirbeo/auth";

export default function DashboardPage() {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-tirbeo-dark-500">Loading...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="font-heading text-2xl font-bold text-tirbeo-crimson-600">
        Dashboard
      </h1>

      {profile && (
        <div className="mt-8 rounded-xl border border-tirbeo-dark-200 bg-white p-6 shadow-sm">
          <p className="text-lg font-semibold">{profile.full_name || profile.username}</p>
          <p className="mt-1 text-sm text-tirbeo-dark-500">
            Karma: {profile.karma_points} &middot; Joined: {new Date(profile.created_at).toLocaleDateString()}
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <a
          href="/feed"
          className="rounded-xl border border-tirbeo-dark-200 bg-white p-6 shadow-sm transition hover:border-tirbeo-crimson-300"
        >
          <h2 className="font-heading font-semibold">Feed</h2>
          <p className="mt-1 text-sm text-tirbeo-dark-500">Browse posts</p>
        </a>
        <a
          href="/chat"
          className="rounded-xl border border-tirbeo-dark-200 bg-white p-6 shadow-sm transition hover:border-tirbeo-crimson-300"
        >
          <h2 className="font-heading font-semibold">Chat</h2>
          <p className="mt-1 text-sm text-tirbeo-dark-500">Direct messages</p>
        </a>
      </div>
    </main>
  );
}
