import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Sections";
import { Chip, PhoneFrame, Reveal } from "@/components/Primitives";
import { PlayBadge, PlayStats, StatusPill } from "@/components/Projects";
import { getContent, getProject } from "@/lib/store";

/** Prerender what exists at build time; slugs added later render on demand. */
export async function generateStaticParams() {
  const { projects } = await getContent();
  return projects.map((p) => ({ slug: p.slug }));
}

export const revalidate = false;
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};
  return {
    title: project.name,
    description: project.summary,
    openGraph: { title: project.name, description: project.summary },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { projects, profile } = await getContent();
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.slug === slug);
  const next = projects[(index + 1) % projects.length];

  return (
    <>
      <Nav profile={profile} />
      <main>
        {/* ---------------------------------------------------------- header */}
        <header className="relative overflow-hidden border-b border-line pb-14 pt-28 sm:pt-36">
          <div className="grid-bg grid-fade pointer-events-none absolute inset-0" />
          <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
            <Link
              href="/#projects"
              className="mono text-[11px] tracking-[0.16em] text-dim transition hover:text-accent"
            >
              ← ALL APPS
            </Link>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
              <StatusPill status={project.status} />
              <span className="mono text-[10px] tracking-[0.16em] text-dim">{project.client}</span>
            </div>

            <h1 className="display mt-5 text-[clamp(2.2rem,7vw,4.2rem)]">{project.name}</h1>

            <p className="mt-6 max-w-2xl text-[15.5px] leading-relaxed text-muted">
              {project.summary}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-3">
              <PlayStats project={project} />
            </div>

            <div className="mono mt-3 text-[11.5px] text-dim">{project.role}</div>

            <div className="mt-8 flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <Chip key={t}>{t}</Chip>
              ))}
            </div>

            {(project.playStoreUrl || project.githubUrl) && (
              <div className="mt-8 flex flex-wrap items-center gap-2.5">
                {project.playStoreUrl && <PlayBadge href={project.playStoreUrl} />}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mono rounded-full border border-line px-3.5 py-2 text-[10.5px] tracking-wide text-muted transition hover:border-accent/40 hover:text-accent"
                  >
                    Source ↗
                  </a>
                )}
              </div>
            )}
          </div>
        </header>

        {/* ---------------------------------------------------------- vitals */}
        {project.metrics && (
          <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
            <div className="label">QUALITY METRICS</div>
            <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
              {project.metrics.map((m, i) => (
                <Reveal key={m.label} delay={i * 0.06} className="bg-bg">
                  <div className="px-5 py-7">
                    <div className="display text-3xl text-accent">{m.value}</div>
                    <div className="label mt-2.5">{m.label}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* ----------------------------------------------------- screenshots */}
        {project.screenshots.length > 0 && (
          <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
            <div className="label">SCREENS</div>
            <div className="thin-scroll mt-5 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-5">
              {project.screenshots.map((src, i) => (
                <div key={src} className="w-[62%] shrink-0 snap-center sm:w-[38%] lg:w-[23%]">
                  <PhoneFrame
                    src={src}
                    alt={`${project.name} screenshot ${i + 1}`}
                    priority={i < 2}
                  />
                </div>
              ))}
            </div>
            <div className="mono text-[10px] tracking-widest text-dim">
              SWIPE / SCROLL →
            </div>
          </section>
        )}

        {/* ------------------------------------------------------ case study */}
        {project.caseStudy && (
          <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
            <div className="space-y-14">
              {project.caseStudy.map((block, i) => (
                <Reveal key={block.heading} delay={0.04}>
                  <article>
                    <div className="flex items-baseline gap-4">
                      <span className="mono text-[11px] tracking-widest text-accent">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h2 className="text-2xl font-semibold tracking-tight">{block.heading}</h2>
                    </div>
                    <p className="mt-5 text-[15.5px] leading-[1.75] text-muted">{block.body}</p>
                    {block.points && (
                      <ul className="mt-6 space-y-3.5 border-l border-line pl-6">
                        {block.points.map((p) => (
                          <li key={p} className="relative text-[14.5px] leading-relaxed text-muted">
                            <span className="absolute -left-[26px] top-[9px] h-1.5 w-1.5 rounded-full bg-accent/70" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                </Reveal>
              ))}
            </div>

            <div className="mt-16 flex items-center gap-3 rounded-2xl border border-accent/25 bg-accent/[0.06] px-6 py-5">
              <span className="h-px w-6 shrink-0 bg-accent" />
              <span className="mono text-[12px] leading-relaxed tracking-wide text-accent">
                {project.punchline}
              </span>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------ next / CTA */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
            <div className="label">NEXT APP</div>
            <Link href={`/projects/${next.slug}`} className="group mt-4 block">
              <div className="flex items-baseline justify-between gap-6">
                <h3 className="display text-[clamp(1.8rem,5vw,3rem)] transition-colors group-hover:text-accent">
                  {next.name}
                </h3>
                <span className="mono text-dim transition group-hover:translate-x-1 group-hover:text-accent">
                  →
                </span>
              </div>
              <p className="mt-3 max-w-xl text-[14px] text-muted">{next.summary}</p>
            </Link>
          </div>
        </section>
      </main>
      <Footer profile={profile} />
    </>
  );
}
