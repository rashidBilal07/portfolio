import type { Metadata } from "next";
import { adminConfigured } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const configured = adminConfigured();

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-5">
      <div className="grid-bg grid-fade pointer-events-none absolute inset-0" />

      <div className="relative w-full max-w-sm">
        <div className="mono text-[11px] tracking-[0.2em] text-accent">ADMIN</div>
        <h1 className="display mt-4 text-4xl">Sign in</h1>

        {configured ? (
          <LoginForm />
        ) : (
          <div className="mt-8 rounded-2xl border border-accent2/30 bg-accent2/[0.06] p-5">
            <div className="mono text-[11px] tracking-[0.16em] text-accent2">NOT CONFIGURED</div>
            <p className="mt-3 text-[13.5px] leading-relaxed text-muted">
              Create <code className="mono text-fg">.env.local</code> in the project root with an
              admin password and a signing secret, then restart the dev server:
            </p>
            <pre className="mono mt-4 overflow-x-auto rounded-lg border border-line bg-elev p-3.5 text-[11px] leading-relaxed text-muted">
              {`ADMIN_PASSWORD=pick-something-long\nAUTH_SECRET=<openssl rand -base64 32>`}
            </pre>
            <p className="mt-3 text-[12.5px] leading-relaxed text-dim">
              The admin stays disabled until both are set — it never falls back to an open state.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
