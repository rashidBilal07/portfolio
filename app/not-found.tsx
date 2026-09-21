import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-5">
      <div className="grid-bg grid-fade pointer-events-none absolute inset-0" />
      <div className="relative text-center">
        <div className="mono text-[11px] tracking-[0.2em] text-accent">
          TEST FAILED: navigation
        </div>
        <h1 className="display mt-5 text-[clamp(3rem,12vw,7rem)]">404</h1>
        <p className="mono mt-4 text-[12.5px] text-muted">
          AssertionError: expected a page at this route, found none
        </p>
        <Link
          href="/"
          className="mono mt-9 inline-block rounded-full bg-accent px-5 py-2.5 text-xs font-medium tracking-wide text-[#07090c] transition hover:bg-accent-dim"
        >
          go home
        </Link>
      </div>
    </main>
  );
}
