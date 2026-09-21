"use client";

import { useState } from "react";
import type { Content } from "@/lib/schema";
import { Button, Card, Field, ListField, Repeater, StatusLine, TextArea } from "./ui";
import { useSave } from "./useSave";

type Editable = Pick<
  Content,
  "experience" | "skillGroups" | "certifications" | "education" | "principles"
>;

export function SectionsEditor({
  content,
  onSaved,
}: {
  content: Content;
  onSaved: (next: Partial<Content>) => void;
}) {
  const [draft, setDraft] = useState<Editable>({
    experience: content.experience,
    skillGroups: content.skillGroups,
    certifications: content.certifications,
    education: content.education,
    principles: content.principles,
  });
  const [dirty, setDirty] = useState(false);
  const { status, save } = useSave();

  const set = <K extends keyof Editable>(key: K, value: Editable[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setDirty(true);
  };

  async function submit() {
    const result = await save("/api/admin/content", "PATCH", draft);
    if (result.ok) {
      onSaved(result.data as Partial<Content>);
      setDirty(false);
    }
  }

  const actions = (
    <div className="flex items-center gap-3">
      <StatusLine status={status} />
      <Button onClick={submit} disabled={!dirty || status.kind === "saving"}>
        save
      </Button>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* --------------------------------------------------------- experience */}
      <Card title="Experience" description="Newest first — this is the timeline order." actions={actions}>
        <Repeater
          items={draft.experience}
          onChange={(v) => set("experience", v)}
          create={() => ({
            company: "",
            title: "",
            from: "",
            to: "PRESENT",
            location: "",
            bullets: [],
            tech: [],
          })}
          addLabel="add job"
          itemLabel={(j) => j.company || "untitled"}
          render={(job, update) => (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="COMPANY" value={job.company} onChange={(v) => update({ company: v })} />
                <Field label="TITLE" value={job.title} onChange={(v) => update({ title: v })} />
                <Field
                  label="FROM"
                  value={job.from}
                  onChange={(v) => update({ from: v })}
                  hint='e.g. "JAN 2025"'
                />
                <Field
                  label="TO"
                  value={job.to}
                  onChange={(v) => update({ to: v })}
                  hint='e.g. "PRESENT"'
                />
              </div>
              <Field
                label="LOCATION"
                value={job.location}
                onChange={(v) => update({ location: v })}
              />
              <TextArea
                label="INTRO"
                value={job.intro ?? ""}
                onChange={(v) => update({ intro: v || undefined })}
                rows={3}
                hint="Optional framing sentence above the bullets."
              />
              <ListField
                label="BULLETS"
                value={job.bullets}
                onChange={(v) => update({ bullets: v })}
                rows={7}
                hint="One per line."
              />
              <ListField label="TECH" value={job.tech} onChange={(v) => update({ tech: v })} />
            </div>
          )}
        />
      </Card>

      {/* --------------------------------------------------------------- stack */}
      <Card title="Stack" description="The grid of skill groups." actions={actions}>
        <Repeater
          items={draft.skillGroups}
          onChange={(v) => set("skillGroups", v)}
          create={() => ({ label: "", items: [] })}
          addLabel="add group"
          itemLabel={(g) => g.label || "untitled"}
          render={(group, update) => (
            <div className="space-y-4">
              <Field
                label="GROUP LABEL"
                value={group.label}
                onChange={(v) => update({ label: v })}
                hint='e.g. "JETPACK"'
              />
              <ListField
                label="ITEMS"
                value={group.items}
                onChange={(v) => update({ items: v })}
                rows={3}
              />
            </div>
          )}
        />
      </Card>

      {/* ----------------------------------------------------------- approach */}
      <Card title="Approach" description="The “how I work” principles. Four reads best." actions={actions}>
        <Repeater
          items={draft.principles}
          onChange={(v) => set("principles", v)}
          create={() => ({ n: String(draft.principles.length + 1).padStart(2, "0"), title: "", body: "" })}
          addLabel="add principle"
          itemLabel={(p) => p.title || "untitled"}
          render={(principle, update) => (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-[100px_1fr]">
                <Field label="NUMBER" value={principle.n} onChange={(v) => update({ n: v })} />
                <Field
                  label="TITLE"
                  value={principle.title}
                  onChange={(v) => update({ title: v })}
                />
              </div>
              <TextArea
                label="BODY"
                value={principle.body}
                onChange={(v) => update({ body: v })}
                rows={4}
              />
            </div>
          )}
        />
      </Card>

      {/* ----------------------------------------------------- certifications */}
      <Card title="Certifications" actions={actions}>
        <Repeater
          items={draft.certifications}
          onChange={(v) => set("certifications", v)}
          create={() => ({ name: "", meta: String(new Date().getFullYear()) })}
          addLabel="add certification"
          itemLabel={(c) => c.name || "untitled"}
          render={(cert, update) => (
            <div className="space-y-4">
              <Field label="NAME" value={cert.name} onChange={(v) => update({ name: v })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="ISSUER"
                  value={cert.issuer ?? ""}
                  onChange={(v) => update({ issuer: v || undefined })}
                />
                <Field
                  label="META"
                  value={cert.meta}
                  onChange={(v) => update({ meta: v })}
                  hint='A year, or "VERIFY" when there is a link'
                />
              </div>
              <Field
                label="VERIFY URL"
                value={cert.url ?? ""}
                onChange={(v) => update({ url: v || undefined })}
                hint="Optional. Turns META into a link."
              />
            </div>
          )}
        />
      </Card>

      {/* --------------------------------------------------------- education */}
      <Card title="Education" actions={actions}>
        <Repeater
          items={draft.education}
          onChange={(v) => set("education", v)}
          create={() => ({ degree: "", school: "", years: "" })}
          addLabel="add entry"
          itemLabel={(e) => e.degree || "untitled"}
          render={(entry, update) => (
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="DEGREE" value={entry.degree} onChange={(v) => update({ degree: v })} />
              <Field label="SCHOOL" value={entry.school} onChange={(v) => update({ school: v })} />
              <Field label="YEARS" value={entry.years} onChange={(v) => update({ years: v })} />
            </div>
          )}
        />
      </Card>
    </div>
  );
}
