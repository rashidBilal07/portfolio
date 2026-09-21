"use client";

import Link from "next/link";
import type { Project } from "@/lib/schema";
import { Chip, PhoneFrame, Reveal, SectionHeading, useImageFallback } from "./Primitives";

/* -------------------------------------------------------------------------- */
/* Small bits                                                                 */
/* -------------------------------------------------------------------------- */

export function StatusPill({ status }: { status: Project["status"] }) {
  const live = status === "LIVE ON PLAY" || status === "IN PRODUCTION";
  return (
    <span className="mono inline-flex items-center gap-1.5 text-[10px] tracking-[0.16em] text-dim">
      <span
        className={`h-1.5 w-1.5 rounded-full ${live ? "pulse-dot bg-accent" : "bg-accent2"}`}
      />
      {status}
    </span>
  );
}

/** Play-Store-style rating / installs row. Renders nothing if unset. */
export function PlayStats({ project }: { project: Project }) {
  if (!project.rating && !project.installs) return null;
  return (
    <div className="mono flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-muted">
      {project.rating && (
        <span className="flex items-center gap-1.5">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--accent)" aria-hidden>
            <path d="M12 2.2l3 6.2 6.8 1-4.9 4.8 1.2 6.8L12 17.8 5.9 21l1.2-6.8L2.2 9.4l6.8-1z" />
          </svg>
          <span className="text-fg">{project.rating}</span>
          {project.reviews && <span className="text-dim">({project.reviews})</span>}
        </span>
      )}
      {project.installs && (
        <span>
          <span className="text-fg">{project.installs}</span>
          <span className="text-dim"> installs</span>
        </span>
      )}
      <span className="text-dim">{project.year}</span>
    </div>
  );
}

export function PlayBadge({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      onClick={(e) => e.stopPropagation()}
      className="mono inline-flex items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-3.5 py-2 text-[10.5px] tracking-wide text-accent transition hover:bg-accent/20"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M3.6 1.8c-.3.3-.5.8-.5 1.4v17.6c0 .6.2 1.1.5 1.4l10.1-10.2L3.6 1.8Zm11.4 8.9 2.9-2.9-10-5.7c-.4-.2-.8-.2-1.1-.1L15 10.7Zm0 2.6L6.8 22c.3.1.7.1 1.1-.1l10-5.7-2.9-2.9Zm5.9-4.1-2.3-1.3-3.1 3.1 3.1 3.1 2.3-1.3c.9-.5.9-2 0-2.5v-1.1Z" />
      </svg>
      Google Play
    </a>
  );
}

function GithubLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      onClick={(e) => e.stopPropagation()}
      className="mono inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-2 text-[10.5px] tracking-wide text-muted transition hover:border-accent/40 hover:text-accent"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 .5C5.7.5.5 5.7.5 12a11.5 11.5 0 0 0 7.9 10.9c.6.1.8-.2.8-.6v-2.2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3 0 0 1-.4 3.3 1.2a11.5 11.5 0 0 1 6 0C18.6 3.4 19.6 3.8 19.6 3.8c.6 1.5.2 2.7.1 3 .8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .4.2.7.8.6A11.5 11.5 0 0 0 23.5 12C23.5 5.7 18.3.5 12 .5Z" />
      </svg>
      Source
    </a>
  );
}

/** Rounded app icon, with a lettermark fallback. */
function AppIcon({ project }: { project: Project }) {
  const icon = useImageFallback(project.icon ?? "");
  const letter = project.name.charAt(0);

  return (
    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[14px] border border-line bg-elev2">
      {/* Lettermark sits underneath so a missing icon still reads as an app. */}
      <span className="mono absolute inset-0 grid place-items-center text-base font-semibold text-accent">
        {letter}
      </span>
      {project.icon && !icon.failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={icon.ref}
          src={project.icon}
          alt=""
          className="relative h-full w-full object-cover"
          onError={icon.onError}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Featured card — big, with tilted phone screenshots                         */
/* -------------------------------------------------------------------------- */
function FeaturedCard({ project, index }: { project: Project; index: number }) {
  const flip = index % 2 === 1;

  return (
    <Reveal>
      <article className="group relative overflow-hidden rounded-3xl border border-line bg-elev/40 transition-colors hover:border-line-strong">
        <div
          className={`grid items-center gap-8 p-6 sm:p-10 lg:gap-14 lg:p-12 ${
            flip ? "lg:grid-cols-[0.9fr_1.1fr]" : "lg:grid-cols-[1.1fr_0.9fr]"
          }`}
        >
          {/* ---- copy ---- */}
          <div className={flip ? "lg:order-2" : ""}>
            <div className="flex items-center justify-between gap-4">
              <span className="mono text-[11px] tracking-widest text-dim">
                {String(index + 1).padStart(2, "0")}
              </span>
              <StatusPill status={project.status} />
            </div>

            <div className="mt-6 flex items-start gap-4">
              <AppIcon project={project} />
              <div>
                <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {project.name}
                </h3>
                <div className="mono mt-1 text-[10.5px] tracking-[0.16em] text-dim">
                  {project.client}
                </div>
              </div>
            </div>

            <p className="mt-5 text-[14.5px] leading-relaxed text-muted">{project.summary}</p>

            <div className="mt-5">
              <PlayStats project={project} />
            </div>

            <div className="mono mt-2 text-[11px] text-dim">{project.role}</div>

            <div className="mt-6 flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <Chip key={t}>{t}</Chip>
              ))}
            </div>

            {/* vitals strip */}
            {project.metrics && (
              <div className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
                {project.metrics.map((m) => (
                  <div key={m.label} className="bg-bg px-3 py-3.5">
                    <div className="mono text-[15px] font-medium text-accent">{m.value}</div>
                    <div className="mono mt-1 text-[9px] tracking-[0.14em] text-dim">
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              {project.caseStudy && (
                <Link
                  href={`/projects/${project.slug}`}
                  className="mono inline-flex items-center gap-2 rounded-full bg-fg px-4 py-2 text-[10.5px] tracking-wide text-bg transition hover:opacity-85"
                >
                  Read case study →
                </Link>
              )}
              {project.playStoreUrl && <PlayBadge href={project.playStoreUrl} />}
              {project.githubUrl && <GithubLink href={project.githubUrl} />}
            </div>
          </div>

          {/* ---- screenshots ---- */}
          <div className={flip ? "lg:order-1" : ""}>
            <div className="relative flex items-end justify-center gap-3 sm:gap-5">
              {project.screenshots.slice(0, 3).map((src, i) => (
                <div
                  key={src}
                  className="w-[30%] max-w-[180px] transition-transform duration-500 group-hover:-translate-y-1.5"
                  style={{
                    transform: `rotate(${(i - 1) * 4}deg) translateY(${i === 1 ? -16 : 0}px)`,
                    zIndex: i === 1 ? 2 : 1,
                    transitionDelay: `${i * 60}ms`,
                  }}
                >
                  <PhoneFrame src={src} alt={`${project.name} screenshot ${i + 1}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* punchline footer */}
        <div className="flex items-center gap-3 border-t border-line bg-elev2/50 px-6 py-4 sm:px-10 lg:px-12">
          <span className="h-px w-6 bg-accent" />
          <span className="mono text-[11.5px] tracking-wide text-accent">{project.punchline}</span>
        </div>
      </article>
    </Reveal>
  );
}

/* -------------------------------------------------------------------------- */
/* Compact card — for the rest                                                */
/* -------------------------------------------------------------------------- */
function CompactCard({ project, index }: { project: Project; index: number }) {
  return (
    <Reveal delay={index * 0.05} className="h-full">
      {/* The case-study link is a stretched overlay rather than a wrapper, so the
          Play Store and GitHub buttons stay real anchors instead of nested ones. */}
      <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-elev/40 transition-colors hover:border-accent/35">
        {project.caseStudy && (
          <Link
            href={`/projects/${project.slug}`}
            aria-label={`${project.name} case study`}
            className="absolute inset-0 z-0"
          />
        )}
        <div className="flex-1 p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <span className="mono text-[11px] tracking-widest text-dim">
              {String(index + 1).padStart(2, "0")}
            </span>
            <StatusPill status={project.status} />
          </div>

          <div className="mt-5 flex items-start gap-3.5">
            <AppIcon project={project} />
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold tracking-tight">{project.name}</h3>
              <div className="mono mt-1 text-[10px] tracking-[0.16em] text-dim">{project.client}</div>
            </div>
          </div>

          <p className="mt-4 text-[13.5px] leading-relaxed text-muted">{project.summary}</p>

          <div className="mt-4">
            <PlayStats project={project} />
          </div>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {project.tech.slice(0, 5).map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>

          <div className="relative z-10 mt-6 flex flex-wrap items-center gap-2">
            {project.playStoreUrl && <PlayBadge href={project.playStoreUrl} />}
            {project.githubUrl && <GithubLink href={project.githubUrl} />}
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-line bg-elev2/50 px-6 py-3.5 sm:px-7">
          <span className="h-px w-5 bg-accent" />
          <span className="mono flex-1 text-[11px] tracking-wide text-accent">
            {project.punchline}
          </span>
          {project.caseStudy && (
            <span className="mono text-[11px] text-dim transition group-hover:translate-x-0.5 group-hover:text-accent">
              →
            </span>
          )}
        </div>
      </article>
    </Reveal>
  );
}

/* -------------------------------------------------------------------------- */
/* Section                                                                    */
/* -------------------------------------------------------------------------- */
export function Projects({ projects }: { projects: Project[] }) {
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      <SectionHeading id="projects" index="02" kicker="APPS I'VE TESTED" title="Selected Work" />

      <div className="mt-14 space-y-6">
        {featured.map((p, i) => (
          <FeaturedCard key={p.slug} project={p} index={i} />
        ))}
      </div>

      {rest.length > 0 && (
        <>
          <Reveal>
            <div className="label mt-20 border-b border-line pb-3">ALSO TESTED</div>
          </Reveal>
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((p, i) => (
              <CompactCard key={p.slug} project={p} index={featured.length + i} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
