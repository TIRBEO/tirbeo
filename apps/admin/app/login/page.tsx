"use client";

import { useState } from "react";
import { useAuth } from "@tirbeo/auth";

export default function AdminLoginPage() {
  const { signInWithPassword, signInWithOtp, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = await signInWithPassword(email, password);
    if (result.error) setError(result.error);
  };

  const handleOtpLogin = async () => {
    setError(null);
    const result = await signInWithOtp(email);
    if (result.error) setError(result.error);
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <h1 className="font-heading text-2xl font-bold text-tirbeo-crimson-600">
          Admin Login
        </h1>
        <p className="mt-2 text-sm text-tirbeo-dark-500">
          Sign in to manage Tirbeo
        </p>

        <form onSubmit={handlePasswordLogin} className="mt-8 space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-tirbeo-dark-300 bg-white px-3 py-2 text-sm"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-tirbeo-dark-300 bg-white px-3 py-2 text-sm"
            required
          />

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-tirbeo-crimson-600 px-4 py-2 text-sm font-medium text-white hover:bg-tirbeo-crimson-700"
          >
            Sign In
          </button>
        </form>

        <div className="mt-4 space-y-2">
          <button
            onClick={handleOtpLogin}
            className="w-full rounded-md border border-tirbeo-dark-300 px-4 py-2 text-sm text-tirbeo-dark-700 hover:bg-tirbeo-dark-50"
          >
            Send OTP
          </button>
          <button
            onClick={signInWithGoogle}
            className="w-full rounded-md border border-tirbeo-dark-300 px-4 py-2 text-sm text-tirbeo-dark-700 hover:bg-tirbeo-dark-50"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    </main>
  );
}
