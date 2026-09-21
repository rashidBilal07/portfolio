"use client";

import { useEffect, useRef } from "react";

/** Particles alive at once. Older ones are dropped rather than left to decay. */
const MAX_POINTS = 220;

type Spark = {
  x: number;
  y: number;
  life: number;
  r: number;
  dx: number;
  dy: number;
  hot: number;
};

/** Reads a CSS custom property and returns it as an "r, g, b" triplet. */
function readRgb(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!raw) return fallback;

  const hex = raw.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h =
      hex[1].length === 3
        ? hex[1]
            .split("")
            .map((c) => c + c)
            .join("")
        : hex[1];
    return `${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}`;
  }

  const rgb = raw.match(/rgba?\(([^)]+)\)/i);
  if (rgb) {
    const parts = rgb[1].split(/[,\s/]+/).filter(Boolean);
    if (parts.length >= 3) return `${parts[0]}, ${parts[1]}, ${parts[2]}`;
  }
  return fallback;
}

/**
 * Flame trail that follows the pointer: a fixed, click-through canvas drawn in
 * "lighter" blend so overlapping sparks bloom. Sparks are emitted along the
 * interpolated path between frames (so fast movement stays continuous) and keep
 * rising while the pointer is still. On touch devices the finger drives it, and
 * scrolling counts as movement since the page slides under a stationary finger.
 */
export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    resize();

    // Mobile browsers fire resize when the URL bar hides; only a real width
    // change (or a large height change) warrants clearing the canvas.
    let lastWidth = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === lastWidth && Math.abs(window.innerHeight - height) < 140) return;
      lastWidth = window.innerWidth;
      resize();
    };
    window.addEventListener("resize", onResize);

    // Accent is re-read on theme change so the flame matches light and dark.
    let accent = readRgb("--accent", "61, 220, 132");
    let accentDim = readRgb("--accent-dim", "43, 184, 108");
    const themeObserver = new MutationObserver(() => {
      accent = readRgb("--accent", "61, 220, 132");
      accentDim = readRgb("--accent-dim", "43, 184, 108");
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    let points: Spark[] = [];
    let lastX: number | null = null;
    let lastY: number | null = null;

    const feed = (x: number, y: number) => {
      if (lastX !== null && lastY !== null) {
        const mvx = x - lastX;
        const mvy = y - lastY;
        const dist = Math.hypot(mvx, mvy);
        const steps = Math.min(10, Math.max(2, Math.ceil(dist / 6)));
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          points.push({
            x: lastX + mvx * t + (Math.random() - 0.5) * 3,
            y: lastY + mvy * t + (Math.random() - 0.5) * 3,
            life: 1,
            r: 2 + Math.random() * 3,
            dx: -mvx * 0.04 + (Math.random() - 0.5) * 1.2,
            dy: -mvy * 0.04 - (0.6 + Math.random() * 1.4),
            hot: Math.random(),
          });
        }
      }
      lastX = x;
      lastY = y;
      if (points.length > MAX_POINTS) points.splice(0, points.length - MAX_POINTS);
    };

    const isTouch =
      (navigator.maxTouchPoints || 0) > 0 || window.matchMedia("(hover: none)").matches;

    const cleanups: Array<() => void> = [];

    if (isTouch) {
      const onTouchStart = (e: TouchEvent) => {
        const t = e.touches[0];
        lastX = t.clientX;
        lastY = t.clientY;
      };
      const onTouchMove = (e: TouchEvent) => {
        const t = e.touches[0];
        feed(t.clientX, t.clientY);
      };
      const stop = () => {
        lastX = null;
        lastY = null;
      };
      let lastScrollY = window.scrollY;
      const onScroll = () => {
        if (lastX === null || lastY === null) return;
        const dy = window.scrollY - lastScrollY;
        lastScrollY = window.scrollY;
        if (dy) feed(lastX + (Math.random() - 0.5) * 2, lastY - dy * 0.6);
      };

      document.addEventListener("touchstart", onTouchStart, { passive: true });
      document.addEventListener("touchmove", onTouchMove, { passive: true });
      document.addEventListener("touchend", stop, { passive: true });
      document.addEventListener("touchcancel", stop, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });

      cleanups.push(() => {
        document.removeEventListener("touchstart", onTouchStart);
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", stop);
        document.removeEventListener("touchcancel", stop);
        window.removeEventListener("scroll", onScroll);
      });
    } else {
      const onMove = (e: MouseEvent) => feed(e.clientX, e.clientY);
      const onLeave = () => {
        lastX = null;
        lastY = null;
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseleave", onLeave);
      });
    }

    /** Keeps the flame burning where the pointer rests. */
    const emitIdle = () => {
      if (lastX === null || lastY === null) return;
      for (let k = 0; k < 3; k++) {
        points.push({
          x: lastX + (Math.random() - 0.5) * 8,
          y: lastY + (Math.random() - 0.5) * 4,
          life: 1,
          r: 1.6 + Math.random() * 2.6,
          dx: (Math.random() - 0.5) * 0.8,
          dy: -(1 + Math.random() * 1.8),
          hot: Math.random(),
        });
      }
      if (points.length > MAX_POINTS) points.splice(0, points.length - MAX_POINTS);
    };

    /** Hottest sparks burn to white, cooling through accent to its dim shade. */
    const flameColor = (hot: number, alpha: number) => {
      if (hot > 0.75) return `rgba(236, 255, 244, ${0.85 * alpha})`;
      if (hot > 0.4) return `rgba(${accent}, ${0.7 * alpha})`;
      return `rgba(${accentDim}, ${0.55 * alpha})`;
    };

    let raf = 0;
    const frame = () => {
      emitIdle();
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (let i = points.length - 1; i >= 0; i--) {
        const p = points[i];
        p.life -= 0.028 + Math.random() * 0.02;
        p.x += p.dx;
        p.y += p.dy;
        p.dy -= 0.05; // buoyancy: sparks accelerate upward as they cool
        p.dx *= 0.97;
        if (p.life <= 0) {
          points.splice(i, 1);
          continue;
        }
        const e = p.life * p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.4, p.r * e), 0, Math.PI * 2);
        ctx.fillStyle = flameColor(p.hot * p.life, e);
        ctx.shadowColor = `rgba(${accent}, 0.9)`;
        ctx.shadowBlur = 14 * e;
        ctx.fill();
      }

      // Soft core glow sitting on the pointer itself.
      if (lastX !== null && lastY !== null) {
        const g = ctx.createRadialGradient(lastX, lastY, 0, lastX, lastY, 22);
        g.addColorStop(0, "rgba(236, 255, 244, 0.55)");
        g.addColorStop(0.35, `rgba(${accent}, 0.28)`);
        g.addColorStop(1, `rgba(${accent}, 0)`);
        ctx.beginPath();
        ctx.arc(lastX, lastY, 22, 0, Math.PI * 2);
        ctx.shadowBlur = 0;
        ctx.fillStyle = g;
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      themeObserver.disconnect();
      cleanups.forEach((fn) => fn());
      points = [];
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}
