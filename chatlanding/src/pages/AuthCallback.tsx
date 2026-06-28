import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { exchangeCode, setSession, decodeSession } from "@/lib/session";
import { ACCOUNTS_URL } from "@/lib/config";

type Status = "exchanging" | "success" | "error";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("exchanging");
  const [error, setError] = useState("");

  useEffect(() => {
    const sessionParam = searchParams.get("session");
    const code = searchParams.get("code");

    if (sessionParam) {
      const appSession = decodeSession(sessionParam);
      if (appSession) {
        setSession(appSession);
        setStatus("success");
        setTimeout(() => navigate("/", { replace: true }), 800);
        return;
      }
      setStatus("error");
      setError("Invalid session data");
      return;
    }

    if (!code) {
      setStatus("error");
      setError("No authorization code received");
      return;
    }

    exchangeCode(code)
      .then(() => {
        setStatus("success");
        setTimeout(() => navigate("/", { replace: true }), 800);
      })
      .catch((err) => {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Authentication failed");
      });
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      {status === "exchanging" && (
        <div className="text-center">
          <svg className="mx-auto h-8 w-8 animate-spin text-foreground" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="mt-4 text-sm text-ink-soft">Completing sign in...</p>
        </div>
      )}

      {status === "success" && (
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="mt-4 text-sm text-foreground">Signed in successfully</p>
          <p className="mt-1 text-xs text-ink-soft">Redirecting...</p>
        </div>
      )}

      {status === "error" && (
        <div className="max-w-sm text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">Sign in failed</p>
          <p className="mt-1 text-xs text-destructive">{error}</p>
          <div className="mt-4 flex gap-3 justify-center">
            <a
              href={`${ACCOUNTS_URL}/login?redirect_to=${encodeURIComponent(window.location.origin + "/auth/callback")}`}
              className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90"
            >
              Try again
            </a>
            <a
              href="/"
              className="rounded-lg border border-border px-4 py-2 text-sm text-ink-soft hover:text-foreground"
            >
              Go home
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
