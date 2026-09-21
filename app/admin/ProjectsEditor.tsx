"use client";

import { useState } from "react";
import { projectStatuses, type Project } from "@/lib/schema";
import {
  Button,
  Card,
  Field,
  ListField,
  Repeater,
  Select,
  StatusLine,
  TextArea,
  Toggle,
} from "./ui";
import { useSave } from "./useSave";

/** Slugify a name so the URL segment is derived rather than hand-typed. */
function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function blankProject(): Project {
  return {
    slug: "",
    name: "",
    summary: "",
    punchline: "",
    client: "PERSONAL PRODUCT",
    status: "LIVE ON PLAY",
    year: String(new Date().getFullYear()),
    role: "",
    featured: false,
    screenshots: [],
    tech: [],
  };
}

export function ProjectsEditor({
  projects: initial,
  onChanged,
}: {
  projects: Project[];
  onChanged: (projects: Project[]) => void;
}) {
  const [projects, setProjects] = useState(initial);
  /** slug of the project open for editing, or "__new__" for the add form. */
  const [editing, setEditing] = useState<string | null>(null);

  const commit = (next: Project[]) => {
    setProjects(next);
    onChanged(next);
  };

  if (editing === "__new__") {
    return (
      <ProjectForm
        project={blankProject()}
        isNew
        existingSlugs={projects.map((p) => p.slug)}
        onCancel={() => setEditing(null)}
        onSaved={(project) => {
          commit([...projects, project]);
          setEditing(null);
        }}
        onDeleted={() => setEditing(null)}
      />
    );
  }

  const target = projects.find((p) => p.slug === editing);
  if (target) {
    return (
      <ProjectForm
        project={target}
        existingSlugs={projects.map((p) => p.slug)}
        onCancel={() => setEditing(null)}
        onSaved={(project) => {
          commit(projects.map((p) => (p.slug === project.slug ? project : p)));
          setEditing(null);
        }}
        onDeleted={(slug) => {
          commit(projects.filter((p) => p.slug !== slug));
          setEditing(null);
        }}
      />
    );
  }

  return <ProjectList projects={projects} onEdit={setEditing} onReordered={commit} />;
}

/* -------------------------------------------------------------------------- */
/* List + reorder                                                             */
/* -------------------------------------------------------------------------- */

function ProjectList({
  projects,
  onEdit,
  onReordered,
}: {
  projects: Project[];
  onEdit: (slug: string) => void;
  onReordered: (projects: Project[]) => void;
}) {
  const { status, save } = useSave();

  async function move(from: number, to: number) {
    if (to < 0 || to >= projects.length) return;
    const next = [...projects];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);

    onReordered(next);
    await save("/api/admin/projects", "PUT", next);
  }

  return (
    <Card
      title={`${projects.length} project${projects.length === 1 ? "" : "s"}`}
      description="Order here is the order on the homepage. Featured projects get the large card with phone mockups."
      actions={
        <div className="flex items-center gap-3">
          <StatusLine status={status} />
          <Button onClick={() => onEdit("__new__")}>+ add project</Button>
        </div>
      }
    >
      {projects.length === 0 ? (
        <p className="text-[13.5px] text-muted">
          No projects yet. Add your first app to get started.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {projects.map((project, index) => (
            <li
              key={project.slug}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-bg p-4"
            >
              <span className="mono w-6 shrink-0 text-[11px] text-dim">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-[14px] font-medium">{project.name}</span>
                  {project.featured && (
                    <span className="mono rounded-full border border-accent/35 bg-accent/10 px-2 py-0.5 text-[9px] tracking-wide text-accent">
                      FEATURED
                    </span>
                  )}
                </div>
                <div className="mono mt-1 truncate text-[10.5px] text-dim">
                  /projects/{project.slug} · {project.status}
                  {project.installs ? ` · ${project.installs} installs` : ""}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <Button variant="ghost" onClick={() => move(index, index - 1)}>
                  ↑
                </Button>
                <Button variant="ghost" onClick={() => move(index, index + 1)}>
                  ↓
                </Button>
                <Button variant="ghost" onClick={() => onEdit(project.slug)}>
                  edit
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* Add / edit form                                                            */
/* -------------------------------------------------------------------------- */

function ProjectForm({
  project: initial,
  isNew = false,
  existingSlugs,
  onCancel,
  onSaved,
  onDeleted,
}: {
  project: Project;
  isNew?: boolean;
  existingSlugs: string[];
  onCancel: () => void;
  onSaved: (project: Project) => void;
  onDeleted: (slug: string) => void;
}) {
  const [project, setProject] = useState(initial);
  /** Once the slug is edited by hand, stop deriving it from the name. */
  const [slugLocked, setSlugLocked] = useState(!isNew);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const { status, save, fieldError } = useSave();

  const set = <K extends keyof Project>(key: K, value: Project[K]) =>
    setProject((p) => ({ ...p, [key]: value }));

  const duplicateSlug =
    isNew && project.slug.length > 0 && existingSlugs.includes(project.slug);

  /**
   * Optional string fields must be absent rather than empty, since the schema
   * requires a valid URL when the key is present.
   */
  function payload(): Project {
    const cleaned = { ...project };
    for (const key of ["playStoreUrl", "githubUrl", "installs", "rating", "reviews", "icon"] as const) {
      if (!cleaned[key]) delete cleaned[key];
    }
    if (!cleaned.metrics?.length) delete cleaned.metrics;
    if (!cleaned.caseStudy?.length) delete cleaned.caseStudy;
    return cleaned;
  }

  async function submit() {
    const result = isNew
      ? await save("/api/admin/projects", "POST", payload())
      : await save(`/api/admin/projects/${project.slug}`, "PUT", payload());

    if (result.ok) onSaved((result.data as { project: Project }).project);
  }

  async function remove() {
    const result = await save(`/api/admin/projects/${project.slug}`, "DELETE");
    if (result.ok) onDeleted(project.slug);
  }

  const canSave =
    project.name.trim().length > 0 && project.slug.length > 0 && !duplicateSlug;

  const actions = (
    <div className="flex flex-wrap items-center gap-3">
      <StatusLine status={status} />
      <Button variant="ghost" onClick={onCancel}>
        {isNew ? "cancel" : "back"}
      </Button>
      <Button onClick={submit} disabled={!canSave || status.kind === "saving"}>
        {isNew ? "create project" : "save"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-5">
      <Card
        title={isNew ? "New project" : project.name || "Untitled"}
        description={
          isNew
            ? "Only the name, slug, summary and punchline are required — everything else can come later."
            : `Editing /projects/${project.slug}`
        }
        actions={actions}
      >
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="APP NAME"
              value={project.name}
              onChange={(v) => {
                set("name", v);
                if (!slugLocked) set("slug", slugify(v));
              }}
              error={fieldError("name")}
            />
            <Field
              label="SLUG"
              value={project.slug}
              onChange={(v) => {
                setSlugLocked(true);
                set("slug", slugify(v));
              }}
              hint={
                isNew
                  ? "URL segment. Derived from the name until you edit it."
                  : "Changing the slug is not supported — delete and re-create to rename."
              }
              error={duplicateSlug ? "already in use" : fieldError("slug")}
            />
          </div>

          <TextArea
            label="SUMMARY"
            value={project.summary}
            onChange={(v) => set("summary", v)}
            rows={3}
            hint="One line: what the app is. Shown on the card."
            error={fieldError("summary")}
          />

          <Field
            label="PUNCHLINE"
            value={project.punchline}
            onChange={(v) => set("punchline", v)}
            hint="The single most impressive fact — the green strip at the card's base."
            error={fieldError("punchline")}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="CLIENT"
              value={project.client}
              onChange={(v) => set("client", v)}
              hint='e.g. "PERSONAL PRODUCT", "FINTECH CLIENT"'
              error={fieldError("client")}
            />
            <Select
              label="STATUS"
              value={project.status}
              options={projectStatuses}
              onChange={(v) => set("status", v)}
            />
            <Field
              label="YEAR"
              value={project.year}
              onChange={(v) => set("year", v)}
              error={fieldError("year")}
            />
            <Field
              label="YOUR ROLE"
              value={project.role}
              onChange={(v) => set("role", v)}
              hint='e.g. "Senior QA Analyst — release owner"'
              error={fieldError("role")}
            />
          </div>

          <Toggle
            label="Featured"
            checked={Boolean(project.featured)}
            onChange={(v) => set("featured", v)}
            hint="Large card with tilted phone mockups. Three featured projects is the sweet spot."
          />

          <ListField
            label="TECH"
            value={project.tech}
            onChange={(v) => set("tech", v)}
            hint="4–6 chips, most impressive first."
          />
        </div>
      </Card>

      {/* ------------------------------------------------------- store links */}
      <Card title="Play Store" description="Leave anything blank to hide it." actions={actions}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="PLAY STORE URL"
            value={project.playStoreUrl ?? ""}
            onChange={(v) => set("playStoreUrl", v)}
            placeholder="https://play.google.com/store/apps/details?id=..."
            error={fieldError("playStoreUrl")}
          />
          <Field
            label="SOURCE URL"
            value={project.githubUrl ?? ""}
            onChange={(v) => set("githubUrl", v)}
            placeholder="https://github.com/..."
            error={fieldError("githubUrl")}
          />
          <Field
            label="INSTALLS"
            value={project.installs ?? ""}
            onChange={(v) => set("installs", v)}
            hint='Match how Play shows it, e.g. "50K+"'
            error={fieldError("installs")}
          />
          <Field
            label="RATING"
            value={project.rating ?? ""}
            onChange={(v) => set("rating", v)}
            hint='e.g. "4.6"'
            error={fieldError("rating")}
          />
          <Field
            label="REVIEW COUNT"
            value={project.reviews ?? ""}
            onChange={(v) => set("reviews", v)}
            hint='e.g. "1.2K"'
            error={fieldError("reviews")}
          />
        </div>
      </Card>

      {/* ---------------------------------------------------------- imagery */}
      <Card
        title="Imagery"
        description="Paths to files in /public. A missing file renders a labelled placeholder rather than a broken image."
        actions={actions}
      >
        <div className="space-y-5">
          <Field
            label="ICON PATH"
            value={project.icon ?? ""}
            onChange={(v) => set("icon", v)}
            placeholder={`/icons/${project.slug || "app"}.png`}
            hint="512x512 PNG"
            error={fieldError("icon")}
          />
          <ListField
            label="SCREENSHOTS"
            value={project.screenshots}
            onChange={(v) => set("screenshots", v)}
            rows={4}
            hint="One path per line. The first three show on a featured card, so put your best first."
          />
        </div>
      </Card>

      {/* ----------------------------------------------------------- vitals */}
      <Card
        title="Quality metrics"
        description="The metric strip on the card and case-study page."
        actions={actions}
      >
        <Repeater
          items={project.metrics ?? []}
          onChange={(v) => set("metrics", v)}
          create={() => ({ label: "", value: "" })}
          addLabel="add metric"
          itemLabel={(m) => m.label || "untitled"}
          render={(metric, update) => (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="LABEL"
                value={metric.label}
                onChange={(v) => update({ label: v })}
                hint='e.g. "CRASH-FREE"'
              />
              <Field
                label="VALUE"
                value={metric.value}
                onChange={(v) => update({ value: v })}
                hint='e.g. "99.8%"'
              />
            </div>
          )}
        />
      </Card>

      {/* ------------------------------------------------------- case study */}
      <Card
        title="Case study"
        description="Leave empty and the card will not link to a detail page. Three blocks — problem, approach, outcome — works well."
        actions={actions}
      >
        <Repeater
          items={project.caseStudy ?? []}
          onChange={(v) => set("caseStudy", v)}
          create={() => ({ heading: "", body: "" })}
          addLabel="add section"
          itemLabel={(b) => b.heading || "untitled"}
          render={(block, update) => (
            <div className="space-y-4">
              <Field
                label="HEADING"
                value={block.heading}
                onChange={(v) => update({ heading: v })}
              />
              <TextArea
                label="BODY"
                value={block.body}
                onChange={(v) => update({ body: v })}
                rows={5}
              />
              <ListField
                label="BULLET POINTS"
                value={block.points ?? []}
                onChange={(v) => update({ points: v })}
                rows={5}
                hint="One per line. Optional."
              />
            </div>
          )}
        />
      </Card>

      {/* ----------------------------------------------------------- delete */}
      {!isNew && (
        <Card
          title="Delete"
          description={`Removes ${project.name} from the site and its case-study page. This cannot be undone.`}
        >
          {confirmingDelete ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="mono text-[12px] text-accent2">
                Delete “{project.name}” permanently?
              </span>
              <Button variant="danger" onClick={remove} disabled={status.kind === "saving"}>
                yes, delete
              </Button>
              <Button variant="ghost" onClick={() => setConfirmingDelete(false)}>
                keep it
              </Button>
            </div>
          ) : (
            <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
              delete this project
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
