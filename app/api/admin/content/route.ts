import { NextResponse } from "next/server";
import { parseBody, requireSession, revalidateSite, serverError } from "@/lib/api";
import { getContent, updateContent } from "@/lib/store";
import { contentPatchSchema, contentSchema } from "@/lib/schema";
import { defaultContent } from "@/data/defaults";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The whole-document endpoint. Covers the sections that do not have a
 * dedicated route — experience, skillGroups, certifications, education,
 * principles — and doubles as export/import.
 */

/** GET /api/admin/content — the entire document. */
export async function GET() {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  try {
    return NextResponse.json(await getContent());
  } catch (err) {
    return serverError(err, "read the content");
  }
}

/** PATCH /api/admin/content — replace one or more top-level sections. */
export async function PATCH(request: Request) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const body = await parseBody(request, contentPatchSchema);
  if (!body.ok) return body.response;

  try {
    const content = await updateContent((draft) => {
      Object.assign(draft, body.data);
    });
    revalidateSite();
    return NextResponse.json(content);
  } catch (err) {
    return serverError(err, "update the content");
  }
}

/** PUT /api/admin/content — replace the entire document. */
export async function PUT(request: Request) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const body = await parseBody(request, contentSchema);
  if (!body.ok) return body.response;

  try {
    const content = await updateContent((draft) => {
      Object.assign(draft, body.data);
    });
    revalidateSite();
    return NextResponse.json(content);
  } catch (err) {
    return serverError(err, "replace the content");
  }
}

/**
 * DELETE /api/admin/content — reset everything back to the seed in data/.
 * Destructive: it discards every edit made through the admin.
 * Requires ?confirm=reset so a stray request cannot wipe the site.
 */
export async function DELETE(request: Request) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const confirm = new URL(request.url).searchParams.get("confirm");
  if (confirm !== "reset") {
    return NextResponse.json(
      { error: "Add ?confirm=reset to discard all admin edits and restore the defaults" },
      { status: 400 },
    );
  }

  try {
    const content = await updateContent((draft) => {
      Object.assign(draft, structuredClone(defaultContent));
    });
    revalidateSite();
    return NextResponse.json(content);
  } catch (err) {
    return serverError(err, "reset the content");
  }
}
