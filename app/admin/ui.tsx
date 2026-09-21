"use client";

import { useState } from "react";

/* -------------------------------------------------------------------------- */
/* Form controls                                                              */
/* -------------------------------------------------------------------------- */

const fieldClass =
  "mono w-full rounded-lg border border-line bg-elev px-3 py-2.5 text-[13px] text-fg outline-none transition focus:border-accent/50 disabled:opacity-50";

export function Field({
  label,
  value,
  onChange,
  hint,
  error,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="label block">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldClass} mt-2 ${error ? "border-accent2/60" : ""}`}
      />
      {error ? (
        <span className="mono mt-1.5 block text-[10.5px] text-accent2">{error}</span>
      ) : (
        hint && <span className="mono mt-1.5 block text-[10.5px] text-dim">{hint}</span>
      )}
    </label>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 4,
  hint,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  hint?: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="label block">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldClass} mt-2 resize-y leading-relaxed ${error ? "border-accent2/60" : ""}`}
      />
      {error ? (
        <span className="mono mt-1.5 block text-[10.5px] text-accent2">{error}</span>
      ) : (
        hint && <span className="mono mt-1.5 block text-[10.5px] text-dim">{hint}</span>
      )}
    </label>
  );
}

export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="block">
      <span className="label block">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={`${fieldClass} mt-2`}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
      />
      <span>
        <span className="mono block text-[12.5px] text-fg">{label}</span>
        {hint && <span className="mono mt-0.5 block text-[10.5px] text-dim">{hint}</span>}
      </span>
    </label>
  );
}

/** Comma-or-newline separated list, edited as text. Good enough for tags. */
export function ListField({
  label,
  value,
  onChange,
  hint,
  rows = 2,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  hint?: string;
  rows?: number;
}) {
  // Kept as a local string so typing a comma does not immediately re-split and
  // move the caret. Committed on blur.
  const [draft, setDraft] = useState<string | null>(null);
  const text = draft ?? value.join(", ");

  return (
    <label className="block">
      <span className="label block">{label}</span>
      <textarea
        value={text}
        rows={rows}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (draft === null) return;
          onChange(
            draft
              .split(/[,\n]/)
              .map((item) => item.trim())
              .filter(Boolean),
          );
          setDraft(null);
        }}
        className={`${fieldClass} mt-2 resize-y leading-relaxed`}
      />
      <span className="mono mt-1.5 block text-[10.5px] text-dim">
        {hint ?? "Comma or newline separated"}
      </span>
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/* Layout + feedback                                                          */
/* -------------------------------------------------------------------------- */

export function Card({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-elev/40 p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted">{description}</p>
          )}
        </div>
        {actions}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const styles = {
    primary: "bg-accent text-[#07090c] hover:bg-accent-dim",
    ghost: "border border-line-strong text-fg hover:border-accent/50 hover:text-accent",
    danger: "border border-accent2/45 text-accent2 hover:bg-accent2/10",
  }[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`mono shrink-0 rounded-full px-4 py-2 text-[11px] tracking-wide transition disabled:cursor-not-allowed disabled:opacity-40 ${styles}`}
    >
      {children}
    </button>
  );
}

export type Status =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved"; at: number }
  | { kind: "error"; message: string; fields?: Record<string, string> };

export function StatusLine({ status }: { status: Status }) {
  if (status.kind === "idle") return null;

  if (status.kind === "saving") {
    return <span className="mono text-[11px] text-dim">saving…</span>;
  }
  if (status.kind === "saved") {
    return (
      <span className="mono flex items-center gap-2 text-[11px] text-accent">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        saved
      </span>
    );
  }
  return (
    <span className="mono text-[11px] text-accent2" role="alert">
      {status.message}
    </span>
  );
}

/** Repeating group of sub-records with add / remove / reorder. */
export function Repeater<T>({
  items,
  onChange,
  render,
  create,
  addLabel,
  itemLabel,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  render: (item: T, update: (patch: Partial<T>) => void, index: number) => React.ReactNode;
  // NoInfer keeps T bound to `items`. Without it, a `create` returning an
  // object with the optional fields omitted narrows T and those fields
  // disappear from `update`.
  create: () => NoInfer<T>;
  addLabel: string;
  itemLabel: (item: T, index: number) => string;
}) {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="rounded-xl border border-line bg-bg p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="mono truncate text-[11px] tracking-wide text-dim">
              {String(index + 1).padStart(2, "0")} · {itemLabel(item, index)}
            </span>
            <div className="flex shrink-0 items-center gap-1">
              <IconButton label="Move up" onClick={() => move(index, index - 1)}>
                ↑
              </IconButton>
              <IconButton label="Move down" onClick={() => move(index, index + 1)}>
                ↓
              </IconButton>
              <IconButton
                label="Remove"
                danger
                onClick={() => onChange(items.filter((_, i) => i !== index))}
              >
                ✕
              </IconButton>
            </div>
          </div>
          <div className="mt-4 space-y-4">
            {render(
              item,
              (patch) =>
                onChange(items.map((current, i) => (i === index ? { ...current, ...patch } : current))),
              index,
            )}
          </div>
        </div>
      ))}

      <Button variant="ghost" onClick={() => onChange([...items, create()])}>
        + {addLabel}
      </Button>
    </div>
  );
}

function IconButton({
  children,
  onClick,
  label,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`mono grid h-7 w-7 place-items-center rounded-md border border-line text-[11px] transition hover:border-accent/40 ${
        danger ? "text-accent2 hover:border-accent2/50" : "text-dim hover:text-accent"
      }`}
    >
      {children}
    </button>
  );
}
