import { NextResponse } from "next/server";
import { parseBody, requireSession, revalidateSite, serverError } from "@/lib/api";
import { getContent, updateContent } from "@/lib/store";
import { profileSchema } from "@/lib/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/profile */
export async function GET() {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  try {
    const { profile } = await getContent();
    return NextResponse.json({ profile });
  } catch (err) {
    return serverError(err, "read the profile");
  }
}

/**
 * PATCH /api/admin/profile — update any subset.
 * This is the endpoint for phone number, LinkedIn URL, GitHub link, email, and
 * everything else in the profile:
 *
 *   curl -X PATCH localhost:3000/api/admin/profile \
 *     -H 'content-type: application/json' \
 *     -b 'rb_admin_session=...' \
 *     -d '{"phone":"+92 300 1234567","linkedin":"https://linkedin.com/in/you"}'
 */
export async function PATCH(request: Request) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const body = await parseBody(request, profileSchema.partial());
  if (!body.ok) return body.response;

  try {
    const content = await updateContent((draft) => {
      Object.assign(draft.profile, body.data);
    });
    revalidateSite();
    return NextResponse.json({ profile: content.profile });
  } catch (err) {
    return serverError(err, "update the profile");
  }
}

/** PUT /api/admin/profile — full replace; every field required. */
export async function PUT(request: Request) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const body = await parseBody(request, profileSchema);
  if (!body.ok) return body.response;

  try {
    const content = await updateContent((draft) => {
      draft.profile = body.data;
    });
    revalidateSite();
    return NextResponse.json({ profile: content.profile });
  } catch (err) {
    return serverError(err, "replace the profile");
  }
}
