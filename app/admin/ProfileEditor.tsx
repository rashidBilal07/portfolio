"use client";

import { useState } from "react";
import type { Profile } from "@/lib/schema";
import { Button, Card, Field, ListField, Repeater, StatusLine, TextArea } from "./ui";
import { useSave } from "./useSave";

export function ProfileEditor({
  profile: initial,
  onSaved,
}: {
  profile: Profile;
  onSaved: (profile: Profile) => void;
}) {
  const [profile, setProfile] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const { status, save, fieldError } = useSave();

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setProfile((p) => ({ ...p, [key]: value }));
    setDirty(true);
  };

  async function submit() {
    const result = await save("/api/admin/profile", "PUT", profile);
    if (result.ok) {
      const saved = (result.data as { profile: Profile }).profile;
      setProfile(saved);
      onSaved(saved);
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
      {/* ------------------------------------------------------------ contact */}
      <Card
        title="Contact"
        description="Shown in the contact section, the nav icons and the Person schema search engines read."
        actions={actions}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="EMAIL"
            value={profile.email}
            onChange={(v) => set("email", v)}
            error={fieldError("email")}
          />
          <Field
            label="PHONE"
            value={profile.phone}
            onChange={(v) => set("phone", v)}
            hint="Leave blank to hide the phone row"
            error={fieldError("phone")}
          />
          <Field
            label="GITHUB URL"
            value={profile.github ?? ""}
            onChange={(v) => set("github", v)}
            placeholder="https://github.com/you"
            error={fieldError("github")}
          />
          <Field
            label="GITHUB HANDLE"
            value={profile.githubHandle ?? ""}
            onChange={(v) => set("githubHandle", v)}
            hint="Display text, e.g. github.com/you"
            error={fieldError("githubHandle")}
          />
          <Field
            label="LINKEDIN URL"
            value={profile.linkedin}
            onChange={(v) => set("linkedin", v)}
            placeholder="https://linkedin.com/in/you"
            error={fieldError("linkedin")}
          />
          <Field
            label="LINKEDIN HANDLE"
            value={profile.linkedinHandle}
            onChange={(v) => set("linkedinHandle", v)}
            hint="Display text, e.g. /in/you"
            error={fieldError("linkedinHandle")}
          />
          <Field
            label="PLAY STORE DEVELOPER URL"
            value={profile.playStoreDeveloper ?? ""}
            onChange={(v) => set("playStoreDeveloper", v)}
            error={fieldError("playStoreDeveloper")}
          />
          <Field
            label="CV / RESUME PATH"
            value={profile.resumeUrl}
            onChange={(v) => set("resumeUrl", v)}
            hint="File in /public, e.g. /cv.pdf"
            error={fieldError("resumeUrl")}
          />
          <Field
            label="LOCATION"
            value={profile.location}
            onChange={(v) => set("location", v)}
            error={fieldError("location")}
          />
          <Field
            label="LOCATION (SHORT)"
            value={profile.locationShort}
            onChange={(v) => set("locationShort", v)}
            hint="Used in the hero badge"
            error={fieldError("locationShort")}
          />
        </div>
      </Card>

      {/* ------------------------------------------------------------ identity */}
      <Card title="Identity" description="Your name and title, used across the site." actions={actions}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="FULL NAME"
            value={profile.name}
            onChange={(v) => set("name", v)}
            hint="Also becomes the nav logo"
            error={fieldError("name")}
          />
          <Field
            label="FIRST NAME"
            value={profile.firstName}
            onChange={(v) => set("firstName", v)}
            error={fieldError("firstName")}
          />
          <Field
            label="ROLE"
            value={profile.role}
            onChange={(v) => set("role", v)}
            error={fieldError("role")}
          />
          <Field
            label="ROLE (SHORT)"
            value={profile.roleShort}
            onChange={(v) => set("roleShort", v)}
            error={fieldError("roleShort")}
          />
          <Field
            label="AVAILABILITY BADGE"
            value={profile.availability}
            onChange={(v) => set("availability", v)}
            hint='e.g. "OPEN TO WORK". Blank to hide.'
            error={fieldError("availability")}
          />
          <Field
            label="AVATAR PATH"
            value={profile.avatar}
            onChange={(v) => set("avatar", v)}
            hint="File in /public, e.g. /avatar.jpg"
            error={fieldError("avatar")}
          />
        </div>
      </Card>

      {/* --------------------------------------------------------------- hero */}
      <Card title="Hero" description="The headline, bio and the animated test run." actions={actions}>
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="HEADLINE LINE 1"
              value={profile.headline[0] ?? ""}
              onChange={(v) => set("headline", [v, profile.headline[1] ?? ""])}
              error={fieldError("headline.0")}
            />
            <Field
              label="HEADLINE LINE 2"
              value={profile.headline[1] ?? ""}
              onChange={(v) => set("headline", [profile.headline[0] ?? "", v])}
              error={fieldError("headline.1")}
            />
          </div>

          <Field
            label="ACCENT WORD"
            value={profile.headlineAccent}
            onChange={(v) => set("headlineAccent", v)}
            hint="A word from line 2 — it gets the green underline. Must match exactly."
            error={fieldError("headlineAccent")}
          />

          <TextArea
            label="BIO"
            value={profile.bio}
            onChange={(v) => set("bio", v)}
            rows={5}
            hint="Wrap words in **double asterisks** to bold them."
            error={fieldError("bio")}
          />

          <ListField
            label="ORBIT BADGES"
            value={profile.orbitBadges}
            onChange={(v) => set("orbitBadges", v)}
            hint="Up to 8. These circle your photo — 5 or 6 looks best."
          />

          <ListField
            label="TERMINAL LINES"
            value={profile.terminalLines}
            onChange={(v) => set("terminalLines", v)}
            rows={4}
            hint='Newline separated. Lines starting with ">" render as runner output; a line starting with "PASSED" turns green.'
          />

          <ListField
            label="MARQUEE"
            value={profile.marquee}
            onChange={(v) => set("marquee", v)}
            rows={3}
            hint="The scrolling tech strip under the hero."
          />
        </div>
      </Card>

      {/* -------------------------------------------------------------- stats */}
      <Card
        title="Stats"
        description="The four animated counters. Value is the number it counts up to."
        actions={actions}
      >
        <Repeater
          items={profile.stats}
          onChange={(v) => set("stats", v)}
          create={() => ({ value: 0, suffix: "+", label: "NEW STAT" })}
          addLabel="add stat"
          itemLabel={(s) => s.label || "untitled"}
          render={(stat, update) => (
            <div className="grid gap-4 sm:grid-cols-4">
              <Field
                label="VALUE"
                type="number"
                value={String(stat.value)}
                onChange={(v) => update({ value: Number(v) || 0 })}
              />
              <Field
                label="SUFFIX"
                value={stat.suffix}
                onChange={(v) => update({ suffix: v })}
              />
              <Field
                label="DECIMALS"
                type="number"
                value={String(stat.decimals ?? 0)}
                onChange={(v) => update({ decimals: Number(v) || 0 })}
              />
              <Field label="LABEL" value={stat.label} onChange={(v) => update({ label: v })} />
            </div>
          )}
        />
      </Card>
    </div>
  );
}
