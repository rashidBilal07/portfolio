"use client";

import Link from "next/link";
import type {
  Certification,
  Education,
  Job,
  Principle,
  Profile,
  SkillGroup,
} from "@/lib/schema";
import { Chip, Counter, Reveal, SectionHeading } from "./Primitives";

/* ========================================================================== */
/* Marquee                                                                    */
/* ========================================================================== */
export function Marquee({ profile }: { profile: Profile }) {
  const items = [...profile.marquee, ...profile.marquee];
  return (
    <div className="marquee-wrap relative overflow-hidden border-y border-line bg-elev/40 py-4">
      <div className="marquee-track">
        {items.map((item, i) => (
          <span
            key={i}
            className="mono flex items-center whitespace-nowrap px-5 text-[13px] text-muted"
          >
            {item}
            <span className="ml-5 text-accent/50">/</span>
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-bg to-transparent" />
    </div>
  );
}

/* ========================================================================== */
/* Stats                                                                      */
/* ========================================================================== */
export function Stats({ profile }: { profile: Profile }) {
  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4">
        {profile.stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.07} className="bg-bg">
            <div className="px-5 py-8 sm:px-7 sm:py-10">
              <div className="display text-4xl text-accent sm:text-5xl">
                <Counter
                  value={s.value}
                  suffix={s.suffix}
                  decimals={"decimals" in s ? (s.decimals as number) : 0}
                />
              </div>
              <div className="label mt-3">{s.label}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/* ========================================================================== */
/* Experience timeline                                                        */
/* ========================================================================== */
export function Experience({ experience }: { experience: Job[] }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      <SectionHeading
        id="work"
        index="01"
        kicker="WHERE I'VE WORKED"
        title="Experience"
      />

      <div className="mt-14 space-y-4">
        {experience.map((job, i) => (
          <Reveal key={job.company} delay={i * 0.05}>
            <article className="group grid gap-6 rounded-2xl border border-line bg-elev/40 p-6 transition-colors hover:border-line-strong sm:p-8 lg:grid-cols-[180px_1fr] lg:gap-10">
              {/* meta rail */}
              <div className="lg:border-r lg:border-line lg:pr-8">
                <div className="mono text-[11px] leading-relaxed tracking-wider text-accent">
                  {job.from}
                  <span className="text-dim"> — </span>
                  <br className="hidden lg:block" />
                  {job.to}
                </div>
                <div className="mono mt-2 text-[10.5px] tracking-wider text-dim">
                  {job.location}
                </div>
              </div>

              {/* body */}
              <div>
                <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {job.company}
                </h3>
                <div className="label mt-1.5 !text-muted">{job.title}</div>

                {job.intro && (
                  <p className="mt-5 max-w-3xl text-[14.5px] leading-relaxed text-muted">
                    {job.intro}
                  </p>
                )}

                <ul className="mt-5 space-y-2.5">
                  {job.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex gap-3 text-[14px] leading-relaxed text-muted"
                    >
                      <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-accent/60" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-wrap gap-2">
                  {job.tech.map((t) => (
                    <Chip key={t}>{t}</Chip>
                  ))}
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ========================================================================== */
/* Principles — "how I work"                                                  */
/* ========================================================================== */
export function Principles({ principles }: { principles: Principle[] }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      <SectionHeading
        id="approach"
        index="03"
        kicker="HOW I WORK"
        title="Approach"
      />
      <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
        {principles.map((p, i) => (
          <Reveal key={p.n} delay={i * 0.06} className="bg-bg">
            <div className="h-full p-7 sm:p-9">
              <div className="mono text-[11px] tracking-widest text-accent">
                {p.n}
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">
                {p.title}
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-muted">
                {p.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ========================================================================== */
/* Stack + certifications + education                                         */
/* ========================================================================== */
export function Stack({
  skillGroups,
  certifications,
  education,
}: {
  skillGroups: SkillGroup[];
  certifications: Certification[];
  education: Education[];
}) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      <SectionHeading
        id="stack"
        index="04"
        kicker="TOOLS OF THE TRADE"
        title="Toolkit"
      />

      <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {skillGroups.map((g, i) => (
          <Reveal key={g.label} delay={Math.min(i, 6) * 0.04} className="bg-bg">
            <div className="h-full p-6 sm:p-7">
              <div className="label !text-accent">{g.label}</div>
              <p className="mt-3.5 text-[13.5px] leading-relaxed text-muted">
                {g.items.join(" · ")}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        {/* certifications */}
        {certifications.length > 0 && (
          <Reveal>
            <div className="label border-b border-line pb-3">
              CERTIFICATIONS
            </div>
            <ul className="mt-1">
              {certifications.map((c) => (
                <li
                  key={c.name}
                  className="flex items-baseline gap-4 border-b border-line py-4 text-[14px]"
                >
                  <span className="flex-1 text-muted">
                    {c.name}
                    {c.issuer && (
                      <span className="text-dim"> — {c.issuer}</span>
                    )}
                  </span>
                  {c.url ? (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mono shrink-0 text-[10px] tracking-widest text-accent transition hover:underline"
                    >
                      {c.meta} ↗
                    </a>
                  ) : (
                    <span className="mono shrink-0 text-[10px] tracking-widest text-dim">
                      {c.meta}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        {/* education */}
        <Reveal delay={0.08}>
          <div className="label border-b border-line pb-3">EDUCATION</div>
          <ul className="mt-1">
            {education.map((e) => (
              <li
                key={e.degree}
                className="flex items-baseline gap-4 border-b border-line py-4 text-[14px]"
              >
                <span className="flex-1">
                  <span className="text-fg">{e.degree}</span>
                  <span className="block text-[13px] text-dim">{e.school}</span>
                </span>
                <span className="mono shrink-0 text-[10px] tracking-widest text-dim">
                  {e.years}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/* ========================================================================== */
/* Contact                                                                    */
/* ========================================================================== */
function contactRows(profile: Profile) {
  return [
    { label: "EMAIL", value: profile.email, href: `mailto:${profile.email}` },
    {
      label: "PHONE",
      value: profile.phone,
      href: profile.phone
        ? `tel:${profile.phone.replace(/\s/g, "")}`
        : undefined,
    },
    ...(profile.github && profile.githubHandle
      ? [{ label: "GITHUB", value: profile.githubHandle, href: profile.github }]
      : []),
    {
      label: "LINKEDIN",
      value: profile.linkedinHandle,
      href: profile.linkedin,
    },
    { label: "LOCATION", value: profile.location },
  ];
}

export function Contact({ profile }: { profile: Profile }) {
  return (
    <section className="relative overflow-hidden border-t border-line">
      <div className="grid-bg grid-fade pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <SectionHeading
          id="contact"
          index="05"
          kicker="LET'S TALK"
          title="Contact"
        />

        <div className="mt-14 grid gap-14 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <h3 className="display text-[clamp(2rem,6vw,3.6rem)]">
              Got an app to test?
              <br />
              <span className="text-accent">Let&apos;s break it first.</span>
            </h3>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted">
              Open to senior QA roles, contract testing engagements, and setting
              up a test process for a team that ships without one. Fastest way
              to reach me is email.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`mailto:${profile.email}`}
                className="mono rounded-full bg-accent px-5 py-2.5 text-xs font-medium tracking-wide text-[#07090c] transition hover:bg-accent-dim"
              >
                send an email
              </a>
              <a
                href={profile.resumeUrl}
                className="mono rounded-full border border-line-strong px-5 py-2.5 text-xs tracking-wide transition hover:border-accent/50 hover:text-accent"
              >
                download cv
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <ul className="border-t border-line">
              {contactRows(profile).map((r) => (
                <li key={r.label} className="border-b border-line">
                  {r.href ? (
                    <a
                      href={r.href}
                      target={r.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer noopener"
                      className="group flex items-center gap-5 py-4 transition-colors hover:text-accent"
                    >
                      <span className="label w-24 shrink-0">{r.label}</span>
                      <span className="flex-1 break-all text-[14.5px]">
                        {r.value}
                      </span>
                      <span className="mono text-dim transition group-hover:translate-x-0.5 group-hover:text-accent">
                        ↗
                      </span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-5 py-4">
                      <span className="label w-24 shrink-0">{r.label}</span>
                      <span className="flex-1 text-[14.5px] text-muted">
                        {r.value}
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ========================================================================== */
/* Footer                                                                     */
/* ========================================================================== */
export function Footer({ profile }: { profile: Profile }) {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 sm:flex-row sm:items-center sm:px-8">
        <span className="mono text-[10.5px] tracking-[0.16em] text-dim">
          © {new Date().getFullYear()} {profile.name.toUpperCase()} ·{" "}
          {profile.role.toUpperCase()}
        </span>
        <span className="mono ml-auto flex items-center gap-2 text-[10.5px] tracking-[0.16em] text-dim">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />
          BUILD SUCCESSFUL
        </span>
      </div>
      <div className="mx-auto max-w-7xl px-5 pb-7 sm:px-8">
        <Link
          href="/#work"
          className="mono text-[10.5px] tracking-[0.16em] text-dim hover:text-accent"
        >
          ↑ BACK TO TOP
        </Link>
      </div>
    </footer>
  );
}
