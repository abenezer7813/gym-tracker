"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile, saveProfile } from "@/lib/storage";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (getProfile()) router.replace("/home");
  }, [router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim() || (mode === "signup" && !name.trim())) {
      setError("Fill in all fields to continue.");
      return;
    }
    setError("");
    saveProfile({
      name: mode === "signup" ? name.trim() : email.split("@")[0],
      email: email.trim(),
      loggedInAt: Date.now(),
    });
    router.push("/home");
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center px-6 py-10">
      <div className="mx-auto w-full max-w-sm flex flex-col gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M6.5 7v10M17.5 7v10M3 10v4M21 10v4M6.5 12h11" />
            </svg>
          </div>
          <div>
            <div className="font-display text-2xl font-bold tracking-tight text-text">Apex</div>
            <p className="mt-1 text-sm text-text-dim">Train with intention. Track every rep.</p>
          </div>
        </div>

        <div className="flex rounded-full border border-border bg-surface p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setMode("login")}
            className="flex-1 rounded-full py-2 transition-colors"
            style={{
              background: mode === "login" ? "var(--accent)" : "transparent",
              color: mode === "login" ? "#0a0c0e" : "var(--text-dim)",
            }}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className="flex-1 rounded-full py-2 transition-colors"
            style={{
              background: mode === "signup" ? "var(--accent)" : "transparent",
              color: mode === "signup" ? "#0a0c0e" : "var(--text-dim)",
            }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "signup" && (
            <Field label="Name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Vance"
                className="input"
                autoComplete="name"
              />
            </Field>
          )}
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input"
              autoComplete="email"
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input"
              autoComplete="current-password"
            />
          </Field>

          {mode === "login" && (
            <button type="button" className="self-end text-xs font-semibold text-text-dim">
              Forgot password?
            </button>
          )}

          {error && <p className="text-xs font-semibold text-danger">{error}</p>}

          <button
            type="submit"
            className="mt-2 w-full rounded-2xl bg-accent py-4 text-sm font-bold text-[#0a0c0e]"
          >
            {mode === "login" ? "Log In" : "Create Account"}
          </button>
        </form>

        <div className="flex items-center gap-3 text-xs text-text-faint">
          <div className="h-px flex-1 bg-border" />
          or
          <div className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          onClick={handleSubmit as unknown as () => void}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-3.5 text-sm font-semibold text-text"
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.55c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.55-2.77c-.99.66-2.25 1.06-3.73 1.06-2.87 0-5.3-1.94-6.17-4.53H2.18v2.85A11 11 0 0 0 12 23z" />
            <path fill="#FBBC05" d="M5.83 14.1a6.6 6.6 0 0 1 0-4.2V7.05H2.18a11 11 0 0 0 0 9.9z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.05l3.65 2.85C6.7 7.32 9.13 5.38 12 5.38z" />
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-text-dim">{label}</span>
      {children}
    </label>
  );
}
