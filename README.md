# Abdul Hafeez — Software QA Engineer Portfolio

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion.
Statically generated, dark-first with a light theme, and built so that adding a
QA engagement is a single object in one file.

```bash
npm install
cp .env.example .env.local   # then fill in ADMIN_PASSWORD and AUTH_SECRET
npm run dev                  # http://localhost:3000  ·  admin at /admin
```

---

## 1. Make it yours

Two ways to edit content:

1. **The admin UI** at `/admin` — add, remove and reorder projects, edit your
   phone, LinkedIn, GitHub and everything else, live, no redeploy. See
   [section 5](#5-admin--addremove-projects-and-edit-info-from-the-browser).
2. **The files in `data/`** — the seed content, and what the site falls back to
   before anything has been saved through the admin.

No component edits are needed for normal content changes either way.

| File | What it controls |
| --- | --- |
| `data/profile.ts` | Name, role, hero headline, bio, email/phone/socials, orbiting hero badges, the tools marquee, the animated counters, and the test run in the hero terminal. |
| `data/projects.ts` | Every QA engagement: screenshots, Play Store link, installs, rating, tooling chips, quality metrics, and the long-form case study. |
| `data/experience.ts` | Job timeline. Newest first. |
| `data/skills.ts` | QA skills grid, certifications, education, and the four "Approach" principles. |

Start with `data/profile.ts` — replace the placeholder name, email, phone,
GitHub and LinkedIn.

**What is real and what is not.**

Real, taken from Abdul Hafeez's CV: name, role, contact details, LinkedIn,
location, the ITGlobe role and its responsibilities, the skill and tool lists,
education, and the "65+ apps tested" figure.

Real, taken from Google Play: every app name, publisher, package, install
bucket, rating and review count in `data/projects.ts`, plus all icons and
screenshots in `public/`.

Written to fit the layout, and worth a review before publishing: the per-app
case-study narratives. The CV confirms the app *categories* Hafeez tested
(cleaner, app locker, message recovery, QR scanner, PDF reader, translator,
casting, MP3 converter, prank sounds), but not which specific listing or what
was found in each. The `year` on each project is his ITGlobe tenure, not a
per-app date. `metrics` deliberately state testing scope rather than invented
statistics.

---

## 2. Adding an engagement

Copy any object in `data/projects.ts`, change the fields, and it appears on the
homepage and gets its own static case-study page at `/projects/<slug>`.

```ts
{
  slug: "my-new-app",               // becomes /projects/my-new-app
  name: "My New App",
  summary: "One line: what it is.",
  punchline: "The single most impressive fact",   // green strip at the card's base
  client: "PERSONAL PRODUCT",
  status: "LIVE ON PLAY",
  year: "2026",
  role: "QA Analyst — manual + automation",
  featured: true,                   // big card with phone mockups; keep to ~3

  playStoreUrl: "https://play.google.com/store/apps/details?id=...",
  githubUrl: "https://github.com/...",
  installs: "10K+",
  rating: "4.7",
  reviews: "480",

  icon: "/icons/my-new-app.png",
  screenshots: [
    "/screenshots/my-new-app/1.png",
    "/screenshots/my-new-app/2.png",
  ],
  tech: ["Appium", "TestRail", "JIRA"],

  metrics: [                        // quality metrics on the case-study page
    { label: "CRASH-FREE", value: "99.9%" },
    { label: "ESCAPE RATE", value: "0.3%" },
  ],

  caseStudy: [                      // omit entirely and the card won't link out
    { heading: "The problem", body: "..." },
    { heading: "What I built", body: "...", points: ["...", "..."] },
    { heading: "The outcome", body: "..." },
  ],
}
```

Every optional field can be left out and the UI adapts — no rating means no
rating row, no `caseStudy` means the card has no detail page.

### Images

```
public/
  avatar.jpg                     # your photo, square, ~800x800
  icons/<slug>.png               # app icon, 512x512
  screenshots/<slug>/1.png       # portrait phone screenshots, 1080x2340-ish
  abdul-hafeez-sqa-engineer.pdf  # your CV
```

Any image that is missing renders a labelled placeholder showing the path it
expects, so you can lay the site out before you have the assets. Grab
screenshots straight from your Play Store listing.

`featured: true` cards show the first three screenshots in tilted phone frames,
so put your best three first.

---

## 3. Design system

Colors live as CSS variables in `app/globals.css` under `:root` and
`:root[data-theme="light"]`. The accent is green (`#3ddc84`) and is
deliberately the same in both themes.

To rebrand, change `--accent`, `--accent-dim` and `--accent-glow` in both
blocks. Nothing else hardcodes a color.

| Token | Use |
| --- | --- |
| `--bg`, `--bg-elev`, `--bg-elev-2` | Page and card surfaces |
| `--line`, `--line-strong` | Borders |
| `--fg`, `--fg-muted`, `--fg-dim` | Text scale |
| `--accent` | Brand green |

Tailwind consumes these via `@theme inline`, so `bg-elev`, `text-muted`,
`border-line` etc. are available as normal utilities.

Theme choice persists in `localStorage` and is applied by a blocking inline
script in `app/layout.tsx` before first paint, so there is no flash.

---

## 4. Before you deploy

- [ ] Replace the placeholder email, phone, GitHub and LinkedIn in `data/profile.ts`
- [ ] Replace all invented project content with your real apps and real metrics
- [ ] Add `public/avatar.jpg` and your CV PDF
- [ ] Add real screenshots and icons
- [ ] Set `SITE_URL` in `.env.local` to your domain (used by metadata, sitemap and robots)
- [ ] Add `public/opengraph-image.png` (1200x630) for link previews
- [ ] **Change `ADMIN_PASSWORD` and `AUTH_SECRET` in `.env.local` from the dev values**
- [ ] Decide where `content.json` lives if you are self-hosting (see section 5)

---

## 5. Admin — add/remove projects and edit info from the browser

There are two ways to change content: edit `data/*.ts` and redeploy, or sign in
at `/admin` and edit it live. The admin writes a JSON store that overrides the
seed files from then on.

### Setup

Copy `.env.example` to `.env.local` and fill both values:

```
ADMIN_PASSWORD=pick-something-long
AUTH_SECRET=<openssl rand -base64 32>
```

Then restart the dev server and open `/admin`. **Until both are set the admin
returns 503 and `/admin` redirects to a setup notice — it never falls back to
an open state.**

### How storage works

- `data/*.ts` is the **seed**: what the site ships with.
- The first save writes **`content.json`** in the project root, and the site
  reads that from then on.
- `DELETE /api/admin/content?confirm=reset` discards the store and restores the
  seed.
- Set `CONTENT_STORE_PATH` to move the file — point it at a mounted volume on a
  container host so edits survive a redeploy.

Public pages stay statically rendered; every write calls `revalidatePath`, so
an edit is live on the next request without a rebuild.

### Where the content is stored

The store picks its backend automatically:

| Environment | Backend | Notes |
| --- | --- | --- |
| Vercel (any env with `BLOB_READ_WRITE_TOKEN`) | **Vercel Blob** | What makes `/admin` saves work in production |
| `npm run dev`, VPS, Docker, Railway, Render, Fly | Local filesystem | `./content.json`, or `CONTENT_STORE_PATH` for a mounted volume |

Nothing to configure in code — the presence of `BLOB_READ_WRITE_TOKEN` decides.

**One-time Vercel setup:** project → **Storage** → **Create** → **Blob** →
connect it to the project. Vercel injects `BLOB_READ_WRITE_TOKEN` into every
environment from then on. Redeploy once so the running deployment picks it up.

Without that token on Vercel the app falls back to the filesystem, where writes
fail with `EROFS` — the runtime filesystem there is read-only and not shared
between invocations. The public site still renders fine in that state, because
reads fall back to the seed in `data/`; only saving breaks.

Two things worth knowing about the Blob backend:

- The object is stored with `access: "public"`, so `content.json` is readable at
  its Blob URL by anyone who has it. That is the same content the site already
  publishes, so there is nothing in it that is not already on the page — but do
  not put anything private in the content model.
- Writes are serialized per instance, not globally. Two saves landing on
  different serverless instances at the same moment can still race. Fine for a
  single editor; it is not real locking.

To move somewhere else, replace `readRaw` and `writeRaw` in
[lib/store.ts](lib/store.ts). Nothing else in the app touches storage.

### Endpoints

All of these require the session cookie and live under `/api/admin`.
Unauthenticated requests get `401`; validation failures get `422` with a
`fields` map naming each bad field.

| Method | Path | Does |
| --- | --- | --- |
| `POST` | `/login` | Exchange the password for a session cookie (12h) |
| `DELETE` | `/login` | Sign out |
| `GET` | `/login` | Whether the caller is signed in |
| `GET` | `/profile` | Read the profile |
| `PATCH` | `/profile` | Update any subset — phone, LinkedIn, GitHub, email, … |
| `PUT` | `/profile` | Replace the whole profile |
| `GET` | `/projects` | List every project |
| `POST` | `/projects` | Add a project (`409` if the slug exists) |
| `PUT` | `/projects` | Replace the whole list — this is how you reorder |
| `GET` | `/projects/:slug` | Read one project |
| `PATCH` | `/projects/:slug` | Update some fields of one project |
| `PUT` | `/projects/:slug` | Replace one project |
| `DELETE` | `/projects/:slug` | Remove a project |
| `GET` | `/content` | The whole document |
| `PATCH` | `/content` | Replace top-level sections (experience, stack, education, …) |
| `PUT` | `/content` | Replace the whole document |
| `DELETE` | `/content?confirm=reset` | Discard all edits, restore the seed |

Example — update your phone number and LinkedIn from the command line:

```bash
curl -c jar -X POST localhost:3000/api/admin/login -H 'content-type: application/json' -d '{"password":"your-password"}'
```

```bash
curl -b jar -X PATCH localhost:3000/api/admin/profile -H 'content-type: application/json' -d '{"phone":"+92 300 1234567","linkedin":"https://linkedin.com/in/you"}'
```

Add a project:

```bash
curl -b jar -X POST localhost:3000/api/admin/projects -H 'content-type: application/json' -d '{"slug":"my-app","name":"My App","summary":"What it is.","punchline":"The impressive bit","client":"PERSONAL PRODUCT","status":"LIVE ON PLAY","year":"2026","role":"Solo","tech":["Kotlin","Compose"],"screenshots":[]}'
```

### Security notes

- Session is an HMAC-signed, httpOnly cookie. `Secure` in production.
- Password and cookie comparisons are constant-time; wrong passwords are
  delayed ~400ms.
- `middleware.ts` blocks `/admin` and `/api/admin` centrally, and every route
  handler re-checks the session independently.
- Slugs are validated against `^[a-z0-9]+(?:-[a-z0-9]+)*$` and image paths must
  be site-relative with no `..`, so nothing user-supplied reaches a filesystem
  path.
- Writes are validated against the same Zod schema the pages render, before and
  after mutation, so a bad payload cannot persist an unrenderable document.
- `/admin` and `/api/` are disallowed in `robots.txt` and marked `noindex`.

**Change `ADMIN_PASSWORD` and `AUTH_SECRET` from the dev values in
`.env.local` before you put this on the internet.**

---

## 6. Deploy

Push to GitHub, then import the repo at [vercel.com/new](https://vercel.com/new).
Zero config — Vercel detects Next.js, builds, and gives you a URL. Add your
custom domain under Project → Settings → Domains.

Every page is statically generated at build time, so it serves from the CDN
with no server cost.

### Or host anywhere static

Add `output: "export"` to `next.config.ts` and run `npm run build`. The `out/`
directory is a plain static site you can drop on GitHub Pages, Netlify or
Cloudflare Pages. Note that this disables `next/image` optimization, which the
site does not currently rely on.

---

## Structure

```
app/
  layout.tsx                metadata, fonts, JSON-LD Person schema, theme script
  page.tsx                  homepage — reads the store, composes the sections
  globals.css               design tokens + animations
  projects/[slug]/page.tsx  case study per app, statically generated
  not-found.tsx             404 styled as a failed test assertion
  sitemap.ts, robots.ts
  admin/                    the editor UI (login, profile, projects, sections)
  api/admin/                the endpoints
components/
  Nav.tsx                   sticky nav, scroll progress, mobile menu
  Hero.tsx                  headline, test-run terminal, orbiting portrait
  Projects.tsx              featured + compact cards, Play badges, quality metrics
  Sections.tsx              marquee, stats, experience, approach, stack, contact
  Primitives.tsx            Reveal, Counter, Chip, PhoneFrame, ThemeToggle
lib/
  schema.ts                 Zod schemas — the single source of types AND validation
  store.ts                  content read/write (swap this file for a database)
  auth.ts                   session cookie + password check
  api.ts                    shared route-handler plumbing
data/                       seed content + defaults.ts
middleware.ts               gate for /admin and /api/admin
content.json                written by the admin; overrides data/ once it exists
```

## Notes

- Scroll reveals are Framer Motion and start at `opacity: 0`. A `<noscript>`
  rule in `app/layout.tsx` forces everything visible if JS fails.
- `prefers-reduced-motion` is respected — all animation is cut to near-zero.
- The homepage is one client-rendered tree under a static shell; first load JS
  is ~164 kB.
