import { NextResponse } from "next/server";
import { parseBody, requireSession, revalidateSite, serverError } from "@/lib/api";
import { getContent, updateContent } from "@/lib/store";
import { projectSchema } from "@/lib/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/projects — every project, in display order. */
export async function GET() {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  try {
    const { projects } = await getContent();
    return NextResponse.json({ projects });
  } catch (err) {
    return serverError(err, "read projects");
  }
}

/** POST /api/admin/projects — add a project. Slug must not already exist. */
export async function POST(request: Request) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const body = await parseBody(request, projectSchema);
  if (!body.ok) return body.response;

  try {
    let conflict = false;
    const content = await updateContent((draft) => {
      if (draft.projects.some((p) => p.slug === body.data.slug)) {
        conflict = true;
        return;
      }
      draft.projects.push(body.data);
    });

    if (conflict) {
      return NextResponse.json(
        { error: `A project with the slug "${body.data.slug}" already exists`, fields: { slug: "already in use" } },
        { status: 409 },
      );
    }

    revalidateSite(body.data.slug);
    return NextResponse.json(
      { project: content.projects.find((p) => p.slug === body.data.slug) },
      { status: 201 },
    );
  } catch (err) {
    return serverError(err, "add the project");
  }
}

/**
 * PUT /api/admin/projects — replace the whole list.
 * The one way to reorder, since order drives the homepage layout.
 */
export async function PUT(request: Request) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const body = await parseBody(request, projectSchema.array());
  if (!body.ok) return body.response;

  const slugs = body.data.map((p) => p.slug);
  const duplicate = slugs.find((slug, i) => slugs.indexOf(slug) !== i);
  if (duplicate) {
    return NextResponse.json(
      { error: `Duplicate slug: "${duplicate}"` },
      { status: 409 },
    );
  }

  try {
    const content = await updateContent((draft) => {
      draft.projects = body.data;
    });
    revalidateSite();
    return NextResponse.json({ projects: content.projects });
  } catch (err) {
    return serverError(err, "save the projects");
  }
}
