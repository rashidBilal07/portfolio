"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? "Sign in failed");
        setPassword("");
        return;
      }

      // `next` comes from the middleware redirect. Only accept an in-app path,
      // so a crafted ?next=https://evil.example cannot turn this into an
      // open redirect.
      const requested = params.get("next");
      const destination =
        requested && requested.startsWith("/") && !requested.startsWith("//")
          ? requested
          : "/admin";

      router.replace(destination);
      router.refresh();
    } catch {
      setError("Could not reach the server");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8">
      <label htmlFor="password" className="label block">
        PASSWORD
      </label>
      <input
        id="password"
        type="password"
        autoComplete="current-password"
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mono mt-2.5 w-full rounded-xl border border-line bg-elev px-4 py-3 text-sm text-fg outline-none transition focus:border-accent/50"
      />

      {error && (
        <p className="mono mt-3 text-[11.5px] text-accent2" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy || password.length === 0}
        className="mono mt-6 w-full rounded-full bg-accent px-5 py-3 text-xs font-medium tracking-wide text-[#07090c] transition hover:bg-accent-dim disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? "signing in…" : "sign in"}
      </button>

      <a
        href="/"
        className="mono mt-5 block text-center text-[11px] tracking-[0.16em] text-dim transition hover:text-accent"
      >
        ← BACK TO SITE
      </a>
    </form>
  );
}
