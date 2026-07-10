"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { appUrl } from "@tirbeo/utils";

function CallbackHandler() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const redirectTo = searchParams.get("redirect") || appUrl("dashboard");

    if (code) {
      // API handles the OAuth exchange and sets the session cookie
      // This page is only reached if the API callback redirects here
      // In normal flow, API redirects directly to dashboard with cookie set
      window.location.href = redirectTo;
    } else {
      // No code - might be direct access or error
      setError("No authorization code provided");
    }
  }, [searchParams]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6" style={{ background: "#08150F" }}>
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E45D5D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <p className="text-white/80 font-medium">Authentication failed</p>
          <p className="text-white/40 text-sm mt-1">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6" style={{ background: "#08150F" }}>
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-accent-green/20 border-t-accent-green rounded-full animate-spin mx-auto" />
        <p className="text-white/40 text-sm mt-4">Completing sign in...</p>
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center" style={{ background: "#08150F" }}>
        <div className="w-8 h-8 border-2 border-accent-green/20 border-t-accent-green rounded-full animate-spin" />
      </main>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
