"use client";

import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/* -------------------------------------------------------------------------- */
/* Reveal: fades + lifts children once when they scroll into view.            */
/* -------------------------------------------------------------------------- */
export function Reveal({
  children,
  delay = 0,
  y = 22,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Counter: animates 0 -> value when scrolled into view.                      */
/* -------------------------------------------------------------------------- */
export function Counter({
  value,
  suffix = "",
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 55, damping: 18 });
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, mv, value]);

  useEffect(() => spring.on("change", (v) => setShown(v)), [spring]);

  return (
    <span ref={ref} className="tabular-nums">
      {shown.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* SectionHeading: "02 / APPS I'VE TESTED" + big title.                       */
/* -------------------------------------------------------------------------- */
export function SectionHeading({
  index,
  kicker,
  title,
  id,
}: {
  index: string;
  kicker: string;
  title: string;
  id?: string;
}) {
  return (
    <div id={id} className="scroll-mt-28">
      <Reveal>
        <div className="flex items-baseline gap-4 border-b border-line pb-5">
          <h2 className="display text-4xl sm:text-5xl md:text-6xl">{title}</h2>
          <span className="label ml-auto hidden shrink-0 sm:block">
            {index} / {kicker}
          </span>
        </div>
        <span className="label mt-3 block sm:hidden">
          {index} / {kicker}
        </span>
      </Reveal>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Chip: small mono tag.                                                      */
/* -------------------------------------------------------------------------- */
export function Chip({
  children,
  accent = false,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <span
      className={`mono rounded-full border px-2.5 py-1 text-[10.5px] tracking-wide ${
        accent
          ? "border-accent/35 bg-accent/10 text-accent"
          : "border-line bg-elev2 text-muted"
      }`}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* ThemeToggle                                                                */
/* -------------------------------------------------------------------------- */
export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "light" ? "light" : "dark");
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* private mode — the choice just won't persist */
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition hover:border-accent/40 hover:text-accent"
    >
      {theme === "dark" ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M20 14.5A8.5 8.5 0 1 1 9.8 4.2a7 7 0 0 0 10.2 10.3Z" />
        </svg>
      )}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* useImageFallback                                                           */
/*                                                                            */
/* A missing image often finishes loading — and failing — before hydration    */
/* attaches onError, so the handler alone never fires. Check the element's     */
/* own state on mount as well.                                                */
/* -------------------------------------------------------------------------- */
export function useImageFallback(src: string) {
  const ref = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    const el = ref.current;
    if (el?.complete && el.naturalWidth === 0) setFailed(true);
  }, [src]);

  return { ref, failed, onError: () => setFailed(true) };
}

/* -------------------------------------------------------------------------- */
/* PhoneFrame: wraps a screenshot in a phone bezel.                           */
/* -------------------------------------------------------------------------- */
export function PhoneFrame({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const { ref, failed, onError } = useImageFallback(src);

  return (
    <div className={`phone aspect-[9/19.5] ${className}`}>
      {failed ? (
        /* Screenshot not dropped in yet — show a labelled placeholder instead
           of a broken image, so the layout is still reviewable. */
        <div className="grid h-full w-full place-items-center bg-elev2 p-4 text-center">
          <div>
            <div className="mono text-[10px] tracking-widest text-dim">SCREENSHOT</div>
            <div className="mono mt-1 break-all text-[9px] text-dim/70">{src}</div>
          </div>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={ref}
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          onError={onError}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}
