"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Content } from "@/lib/schema";
import { ProfileEditor } from "./ProfileEditor";
import { ProjectsEditor } from "./ProjectsEditor";
import { SectionsEditor } from "./SectionsEditor";
import { Button } from "./ui";

const tabs = [
  { id: "profile", label: "profile", hint: "name, contact, hero" },
  { id: "projects", label: "projects", hint: "add / edit / remove apps" },
  { id: "sections", label: "sections", hint: "experience, stack, education" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function AdminShell({
  initialContent,
  storePath,
  usingStore,
}: {
  initialContent: Content;
  storePath: string;
  usingStore: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("profile");
  const [content, setContent] = useState(initialContent);

  async function signOut() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      {/* ------------------------------------------------------------ header */}
      <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-5 sm:px-8">
          <span className="mono text-sm font-medium tracking-tight">
            admin<span className="text-accent">.</span>
          </span>
          <div className="ml-auto flex items-center gap-2.5">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="mono rounded-full border border-line px-3.5 py-2 text-[11px] tracking-wide text-muted transition hover:border-accent/40 hover:text-accent"
            >
              view site ↗
            </a>
            <Button variant="ghost" onClick={signOut}>
              sign out
            </Button>
          </div>
        </div>

        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-5 pb-3 sm:px-8">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`mono shrink-0 rounded-full px-3.5 py-1.5 text-[11px] tracking-wide transition ${
                tab === t.id
                  ? "bg-accent text-[#07090c]"
                  : "border border-line text-muted hover:border-accent/35 hover:text-accent"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {/* -------------------------------------------------------------- body */}
      <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
        {!usingStore && (
          <div className="mb-7 rounded-2xl border border-accent/25 bg-accent/[0.06] p-5">
            <div className="mono text-[11px] tracking-[0.16em] text-accent">
              SHOWING THE DEFAULTS
            </div>
            <p className="mt-2.5 text-[13px] leading-relaxed text-muted">
              Nothing has been saved yet, so the site is serving the seed content from{" "}
              <code className="mono text-fg">data/</code>. The first save writes{" "}
              <code className="mono break-all text-fg">{storePath}</code> and that file takes over
              from then on.
            </p>
          </div>
        )}

        <div className="mb-7">
          <h1 className="display text-3xl">{tabs.find((t) => t.id === tab)?.label}</h1>
          <p className="mt-2 text-[13.5px] text-muted">{tabs.find((t) => t.id === tab)?.hint}</p>
        </div>

        {tab === "profile" && (
          <ProfileEditor
            profile={content.profile}
            onSaved={(profile) => setContent((c) => ({ ...c, profile }))}
          />
        )}

        {tab === "projects" && (
          <ProjectsEditor
            projects={content.projects}
            onChanged={(projects) => setContent((c) => ({ ...c, projects }))}
          />
        )}

        {tab === "sections" && (
          <SectionsEditor
            content={content}
            onSaved={(next) => setContent((c) => ({ ...c, ...next }))}
          />
        )}
      </main>
    </div>
  );
}
