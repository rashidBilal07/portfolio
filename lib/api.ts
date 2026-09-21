import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { SESSION_COOKIE, verifySession } from "./auth";
import { fieldErrors } from "./schema";

/**
 * Shared plumbing for the admin route handlers: auth re-check, JSON body
 * parsing with schema validation, uniform error shapes, and cache busting.
 */

/**
 * Re-check the session inside the handler. Middleware already blocked
 * unauthenticated traffic; this is defence in depth, so a matcher mistake
 * cannot silently expose a write endpoint.
 */
export async function requireSession(): Promise<NextResponse | null> {
  const jar = await cookies();
  if (await verifySession(jar.get(SESSION_COOKIE)?.value)) return null;
  return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
}

type ParseResult<T> = { ok: true; data: T } | { ok: false; response: NextResponse };

export async function parseBody<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<ParseResult<T>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Expected a JSON body" }, { status: 400 }),
    };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Validation failed", fields: fieldErrors(parsed.error) },
        { status: 422 },
      ),
    };
  }

  return { ok: true, data: parsed.data };
}

/**
 * Drop the cached render of every page that shows content, so an edit is live
 * on the next request instead of after the next deploy.
 */
export function revalidateSite(slug?: string) {
  revalidatePath("/");
  revalidatePath("/projects/[slug]", "page");
  if (slug) revalidatePath(`/projects/${slug}`);
}

/** Turns an unexpected throw into a useful response instead of a blank 500. */
export function serverError(err: unknown, action: string): NextResponse {
  const code = (err as NodeJS.ErrnoException)?.code;

  if (code === "EROFS" || code === "EACCES" || code === "EPERM") {
    return NextResponse.json(
      {
        error:
          "The content store is not writable. The filesystem backend cannot be used on " +
          "Vercel or other serverless hosts — see the storage note in lib/store.ts.",
        code,
      },
      { status: 500 },
    );
  }

  console.error(`[admin] ${action} failed:`, err);
  return NextResponse.json({ error: `Could not ${action}` }, { status: 500 });
}
