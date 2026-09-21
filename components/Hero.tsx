"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Profile } from "@/lib/schema";
import { useImageFallback } from "./Primitives";

/** Types the test run out line by line, then holds on the result. */
function TestRunTerminal({ lines: terminalLines }: { lines: string[] }) {
  const [line, setLine] = useState(0);
  const [chars, setChars] = useState(0);

  useEffect(() => {
    const current = terminalLines[line];
    if (chars < current.length) {
      const t = setTimeout(() => setChars((c) => c + 1), 26);
      return () => clearTimeout(t);
    }
    if (line < terminalLines.length - 1) {
      const t = setTimeout(() => {
        setLine((l) => l + 1);
        setChars(0);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [line, chars]);

  const isSuccess = (s: string) =>
    s.startsWith("PASSED") || s.startsWith("BUILD SUCCESSFUL");
  const isTask = (s: string) => s.startsWith(">");
  const done = terminalLines.slice(0, line);
  const typing = terminalLines[line].slice(0, chars);

  return (
    <div className="mono w-full max-w-md overflow-hidden rounded-xl border border-line bg-elev">
      <div className="flex items-center gap-1.5 border-b border-line px-3.5 py-2.5">
        <span className="h-2 w-2 rounded-full bg-line-strong" />
        <span className="h-2 w-2 rounded-full bg-line-strong" />
        <span className="h-2 w-2 rounded-full bg-line-strong" />
        <span className="ml-2 text-[10px] tracking-[0.18em] text-dim">
          TERMINAL
        </span>
      </div>
      <div className="min-h-[110px] space-y-1 px-3.5 py-3 text-[11.5px] leading-relaxed">
        {done.map((l, i) => (
          <div key={i} className={isSuccess(l) ? "text-accent" : "text-muted"}>
            {!isTask(l) && !isSuccess(l) && (
              <span className="text-accent">$ </span>
            )}
            {l}
          </div>
        ))}
        <div
          className={`caret ${isSuccess(typing) ? "text-accent" : "text-muted"}`}
        >
          {!isTask(typing) && !isSuccess(typing) && (
            <span className="text-accent">$ </span>
          )}
          {typing}
        </div>
      </div>
    </div>
  );
}

/**
 * Portrait ring with tech badges orbiting it.
 * --r is the orbit radius and is set per breakpoint alongside the width so the
 * badges always sit just outside the dashed ring.
 */
function OrbitPortrait({ profile }: { profile: Profile }) {
  const badges = profile.orbitBadges;
  const avatar = useImageFallback(profile.avatar);

  return (
    <div className="relative mx-auto aspect-square w-[290px] [--r:143px] sm:w-[350px] sm:[--r:173px] lg:w-[410px] lg:[--r:203px]">
      <div
        className="absolute inset-8 rounded-full blur-3xl"
        style={{ background: "var(--accent-glow)" }}
      />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        aria-hidden
      >
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke="var(--line-strong)"
          strokeWidth="0.3"
          strokeDasharray="1.2 2.6"
        />
        <circle
          cx="50"
          cy="50"
          r="37"
          fill="none"
          stroke="var(--line)"
          strokeWidth="0.3"
        />
      </svg>

      <div className="absolute inset-[16%] grid place-items-center overflow-hidden rounded-full border border-line-strong bg-avatar">
        {avatar.failed ? (
          <span className="mono px-4 text-center text-[9.5px] tracking-widest text-[#e8edf3]">
            /public{profile.avatar}
          </span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={avatar.ref}
            src={profile.avatar}
            alt={profile.name}
            className="h-full w-full object-cover"
            onError={avatar.onError}
          />
        )}
      </div>

      <div className="orbit absolute inset-0" aria-hidden>
        {badges.map((b, i) => {
          const angle = (i / badges.length) * 360;
          return (
            <div
              key={b}
              className="absolute left-1/2 top-1/2"
              style={{
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(calc(-1 * var(--r))) rotate(${-angle}deg)`,
              }}
            >
              <div className="orbit-counter">
                <span className="mono whitespace-nowrap rounded-full border border-line bg-bg/85 px-2.5 py-1 text-[9.5px] tracking-wider text-muted backdrop-blur">
                  {b}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Renders `**bold**` spans from the bio so it stays a single editable string in
 * the admin rather than hand-written JSX. Deliberately not a Markdown parser —
 * it splits on the delimiter and never builds HTML, so nothing is injectable.
 */
function Emphasized({ text }: { text: string }) {
  return (
    <>
      {text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-fg">
            {part}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero({ profile }: { profile: Profile }) {
  const [lineOne, lineTwo] = profile.headline;
  const accentWord = profile.headlineAccent;
  const [before, after] = lineTwo.split(accentWord);

  return (
    <section className="relative overflow-hidden pb-16 pt-28 sm:pt-32">
      <div className="grid-bg grid-fade pointer-events-none absolute inset-0" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_1fr] lg:gap-8">
          {/* left column ------------------------------------------------- */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
              className="flex items-center gap-3"
            >
              <span className="h-px w-8 bg-accent" />
              <span className="label !text-accent">{profile.role}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.08, ease }}
              className="display mt-6 text-[clamp(2.5rem,8.5vw,5.2rem)]"
            >
              {lineOne}
              <br />
              {before}
              <span className="accent-underline">{accentWord}</span>
              {after}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease }}
              className="mt-7 max-w-xl text-[15px] leading-relaxed text-muted"
            >
              <Emphasized text={profile.bio} />
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.32, ease }}
              className="mt-8"
            >
              <TestRunTerminal lines={profile.terminalLines} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.42, ease }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <a
                href="#contact"
                className="mono rounded-full bg-accent px-5 py-2.5 text-xs font-medium tracking-wide text-[#07090c] transition hover:bg-accent-dim"
              >
                hire me
              </a>
              <a
                href="#projects"
                className="mono rounded-full border border-line-strong px-5 py-2.5 text-xs tracking-wide text-fg transition hover:border-accent/50 hover:text-accent"
              >
                see the work
              </a>
              {profile.playStoreDeveloper && (
                <a
                  href={profile.playStoreDeveloper}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mono px-2 py-2.5 text-xs tracking-wide text-dim transition hover:text-accent"
                >
                  play store ↗
                </a>
              )}
            </motion.div>
          </div>

          {/* right column ------------------------------------------------ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.15, ease }}
          >
            <OrbitPortrait profile={profile} />
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="mono text-[10px] tracking-[0.18em] text-accent">
                {profile.availability}
              </span>
              <span className="mono text-[10px] tracking-[0.18em] text-dim">
                · {profile.locationShort}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
