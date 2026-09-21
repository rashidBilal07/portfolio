import { NextResponse } from "next/server";
import { parseBody, requireSession, revalidateSite, serverError } from "@/lib/api";
import { getContent, updateContent } from "@/lib/store";
import { projectPatchSchema, projectSchema } from "@/lib/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

const notFound = (slug: string) =>
  NextResponse.json({ error: `No project with the slug "${slug}"` }, { status: 404 });

/** GET /api/admin/projects/:slug */
export async function GET(_request: Request, { params }: Params) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const { slug } = await params;
  try {
    const { projects } = await getContent();
    const project = projects.find((p) => p.slug === slug);
    return project ? NextResponse.json({ project }) : notFound(slug);
  } catch (err) {
    return serverError(err, "read the project");
  }
}

/**
 * PATCH /api/admin/projects/:slug — update any subset of fields.
 * Passing null for an optional field clears it.
 */
export async function PATCH(request: Request, { params }: Params) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const { slug } = await params;
  const body = await parseBody(request, projectPatchSchema);
  if (!body.ok) return body.response;

  try {
    let found = false;
    const content = await updateContent((draft) => {
      const index = draft.projects.findIndex((p) => p.slug === slug);
      if (index === -1) return;
      found = true;
      // The slug is the identity and is not patchable — delete and re-create
      // to rename, so the old URL does not silently keep resolving.
      draft.projects[index] = { ...draft.projects[index], ...body.data, slug };
    });

    if (!found) return notFound(slug);

    revalidateSite(slug);
    return NextResponse.json({ project: content.projects.find((p) => p.slug === slug) });
  } catch (err) {
    return serverError(err, "update the project");
  }
}

/** PUT /api/admin/projects/:slug — full replace, same slug. */
export async function PUT(request: Request, { params }: Params) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const { slug } = await params;
  const body = await parseBody(request, projectSchema);
  if (!body.ok) return body.response;

  if (body.data.slug !== slug) {
    return NextResponse.json(
      { error: "The slug in the body must match the URL", fields: { slug: "cannot be changed here" } },
      { status: 400 },
    );
  }

  try {
    let found = false;
    const content = await updateContent((draft) => {
      const index = draft.projects.findIndex((p) => p.slug === slug);
      if (index === -1) return;
      found = true;
      draft.projects[index] = body.data;
    });

    if (!found) return notFound(slug);

    revalidateSite(slug);
    return NextResponse.json({ project: content.projects.find((p) => p.slug === slug) });
  } catch (err) {
    return serverError(err, "replace the project");
  }
}

/** DELETE /api/admin/projects/:slug */
export async function DELETE(_request: Request, { params }: Params) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const { slug } = await params;
  try {
    let found = false;
    await updateContent((draft) => {
      const index = draft.projects.findIndex((p) => p.slug === slug);
      if (index === -1) return;
      found = true;
      draft.projects.splice(index, 1);
    });

    if (!found) return notFound(slug);

    revalidateSite(slug);
    return NextResponse.json({ ok: true, deleted: slug });
  } catch (err) {
    return serverError(err, "delete the project");
  }
}
