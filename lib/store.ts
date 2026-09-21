import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { head, put } from "@vercel/blob";
import { contentSchema, type Content } from "./schema";
import { defaultContent } from "@/data/defaults";

/**
 * Content storage.
 *
 * `data/defaults.ts` is the seed: the content the site ships with. The store
 * holds whatever the admin has since changed, and `getContent()` returns the
 * store if it exists and is valid, otherwise the seed.
 *
 * ---------------------------------------------------------------------------
 * TWO BACKENDS, CHOSEN AUTOMATICALLY.
 *
 * Vercel Blob — used whenever BLOB_READ_WRITE_TOKEN is set, which Vercel
 *   injects into every environment once a Blob store is linked to the project.
 *   This is what makes /admin work in production: Vercel's runtime filesystem
 *   is read-only and not shared between invocations, so writing a file there
 *   fails with EROFS and would not persist even if it succeeded.
 *
 * Local filesystem — used otherwise, so `next dev` needs no token and no
 *   network. Also correct for a VPS or a container with a mounted volume.
 *
 * To move somewhere else entirely, replace `readRaw` and `writeRaw`. Nothing
 * else in the app touches storage.
 * ---------------------------------------------------------------------------
 */

/** Object key inside the Blob store. Stable, so the URL never changes. */
const BLOB_KEY = "content.json";

const blobToken = () => process.env.BLOB_READ_WRITE_TOKEN;
const usingBlob = () => Boolean(blobToken());

const filePath = () =>
  process.env.CONTENT_STORE_PATH
    ? path.resolve(process.env.CONTENT_STORE_PATH)
    : path.join(process.cwd(), "content.json");

/* -------------------------------------------------------------------------- */
/* Backends                                                                   */
/* -------------------------------------------------------------------------- */

async function readBlob(): Promise<unknown | null> {
  // `head` gives us both existence and `uploadedAt`. Blob URLs are served
  // through a CDN, so the timestamp is used to bust that cache — without it a
  // save can appear to have done nothing until the edge entry expires.
  let meta;
  try {
    meta = await head(BLOB_KEY, { token: blobToken() });
  } catch {
    return null; // not written yet — fall back to the seed
  }

  const res = await fetch(`${meta.url}?v=${Date.parse(meta.uploadedAt as unknown as string)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`[store] blob fetch failed: ${res.status}`);
  return res.json();
}

async function writeBlob(value: Content): Promise<void> {
  await put(BLOB_KEY, JSON.stringify(value, null, 2), {
    access: "public",
    addRandomSuffix: false, // keep one stable object rather than a new one per save
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0,
    token: blobToken(),
  });
}

async function readFileStore(): Promise<unknown | null> {
  try {
    return JSON.parse(await readFile(filePath(), "utf8"));
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return null; // no store yet — fall back to the seed
    throw err;
  }
}

async function writeFileStore(value: Content): Promise<void> {
  const target = filePath();
  await mkdir(path.dirname(target), { recursive: true });
  // Write to a sibling temp file and rename, so a crash mid-write cannot leave
  // a truncated store behind.
  const tmp = `${target}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
  await rename(tmp, target);
}

const readRaw = (): Promise<unknown | null> => (usingBlob() ? readBlob() : readFileStore());
const writeRaw = (value: Content): Promise<void> =>
  usingBlob() ? writeBlob(value) : writeFileStore(value);

/* -------------------------------------------------------------------------- */
/* Reads                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Deduplicated per request by React's `cache`, so a page that renders several
 * sections reads the store once.
 */
export const getContent = cache(async (): Promise<Content> => {
  let raw: unknown | null;
  try {
    raw = await readRaw();
  } catch (err) {
    // A storage outage must not take the whole site down — every page can
    // still render from the seed.
    console.error("[store] read failed, serving defaults instead:", err);
    return defaultContent;
  }
  if (raw === null) return defaultContent;

  const parsed = contentSchema.safeParse(raw);
  if (parsed.success) return parsed.data;

  // A hand-edited or partially-migrated store should degrade to the seed rather
  // than crash every page.
  console.error(
    "[store] stored content failed validation, serving defaults instead:",
    parsed.error.issues.slice(0, 5),
  );
  return defaultContent;
});

export async function getProject(slug: string) {
  const { projects } = await getContent();
  return projects.find((p) => p.slug === slug);
}

/* -------------------------------------------------------------------------- */
/* Writes                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Read–modify–write the whole document. `mutate` receives a deep clone, so it
 * can edit freely without touching the cached read.
 *
 * Serialized through a promise chain because two concurrent admin requests
 * would otherwise read the same base and one would silently lose its write.
 * That is per-process only. On serverless that means per-instance, so two
 * saves landing on different instances at the same moment can still race —
 * acceptable for a single-editor admin, but it is not real locking.
 */
let queue: Promise<unknown> = Promise.resolve();

export function updateContent(mutate: (draft: Content) => void | Promise<void>): Promise<Content> {
  const run = async (): Promise<Content> => {
    const raw = await readRaw();
    const base = raw === null ? defaultContent : contentSchema.parse(raw);
    const draft = structuredClone(base) as Content;

    await mutate(draft);

    // Re-validate after mutation: a handler bug must not be able to persist a
    // document the pages cannot render.
    const next = contentSchema.parse(draft);
    await writeRaw(next);
    return next;
  };

  const result = queue.then(run, run);
  queue = result.catch(() => undefined);
  return result;
}

/** True when the store has been written at least once. */
export async function storeExists(): Promise<boolean> {
  try {
    return (await readRaw()) !== null;
  } catch {
    return false;
  }
}

/** Human-readable description of the active backend, shown in the admin UI. */
export function contentStorePath(): string {
  return usingBlob() ? `Vercel Blob · ${BLOB_KEY}` : filePath();
}
