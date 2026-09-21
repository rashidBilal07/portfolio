"use client";

import { useCallback, useState } from "react";
import type { Status } from "./ui";

/**
 * Shared save behaviour for the editors: POST/PATCH JSON, surface per-field
 * validation errors from the API, and clear the "saved" badge after a moment.
 */
export function useSave() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const save = useCallback(
    async (
      url: string,
      method: "POST" | "PATCH" | "PUT" | "DELETE",
      body?: unknown,
    ): Promise<{ ok: true; data: unknown } | { ok: false }> => {
      setStatus({ kind: "saving" });

      try {
        const response = await fetch(url, {
          method,
          headers: body === undefined ? undefined : { "content-type": "application/json" },
          body: body === undefined ? undefined : JSON.stringify(body),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          setStatus({
            kind: "error",
            message: data.error ?? `Request failed (${response.status})`,
            fields: data.fields,
          });
          return { ok: false };
        }

        setStatus({ kind: "saved", at: Date.now() });
        setTimeout(
          () => setStatus((s) => (s.kind === "saved" ? { kind: "idle" } : s)),
          2500,
        );
        return { ok: true, data };
      } catch {
        setStatus({ kind: "error", message: "Could not reach the server" });
        return { ok: false };
      }
    },
    [],
  );

  /** Per-field messages from the last failed save, for inline display. */
  const fieldError = (name: string) =>
    status.kind === "error" ? status.fields?.[name] : undefined;

  return { status, save, fieldError, setStatus };
}
