import { NextResponse } from "next/server";
import { z } from "zod";
import {
  SESSION_COOKIE,
  adminConfigured,
  checkPassword,
  createSession,
  sessionCookieOptions,
  verifySession,
} from "@/lib/auth";
import { cookies } from "next/headers";

export const runtime = "nodejs";
/** Never cache an auth endpoint. */
export const dynamic = "force-dynamic";

const bodySchema = z.object({ password: z.string().min(1).max(200) });

/** GET /api/admin/login — is the current caller signed in? */
export async function GET() {
  if (!adminConfigured()) {
    return NextResponse.json({ configured: false, authenticated: false }, { status: 503 });
  }
  const jar = await cookies();
  const authenticated = await verifySession(jar.get(SESSION_COOKIE)?.value);
  return NextResponse.json({ configured: true, authenticated });
}

/** POST /api/admin/login — exchange the password for a session cookie. */
export async function POST(request: Request) {
  if (!adminConfigured()) {
    return NextResponse.json(
      { error: "Admin is not configured. Set ADMIN_PASSWORD and AUTH_SECRET." },
      { status: 503 },
    );
  }

  let parsed;
  try {
    parsed = bodySchema.safeParse(await request.json());
  } catch {
    return NextResponse.json({ error: "Expected a JSON body" }, { status: 400 });
  }
  if (!parsed.success) {
    return NextResponse.json({ error: "A password is required" }, { status: 400 });
  }

  if (!(await checkPassword(parsed.data.password))) {
    // Deliberately vague, and slowed slightly to blunt trivial brute forcing.
    await new Promise((resolve) => setTimeout(resolve, 400));
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const session = await createSession();
  if (!session) {
    return NextResponse.json({ error: "Could not create a session" }, { status: 503 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, session.value, {
    ...sessionCookieOptions,
    maxAge: session.maxAge,
  });
  return response;
}

/** DELETE /api/admin/login — sign out. */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
  return response;
}
