import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
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
 * THIS BACKEND WRITES TO THE LOCAL FILESYSTEM.
 *
 * That works in `next dev`, in `next start` on a VPS, in Docker with a mounted
 * volume, and on Railway/Render/Fly. It does NOT work on Vercel or any other
 * serverless platform, where the filesystem is read-only at runtime and not
 * shared between invocations — writes there will fail with EROFS.
 *
 * To move to a database, replace `readRaw` and `writeRaw` below. Nothing else
 * in the app touches storage.
 * ---------------------------------------------------------------------------
 */

const storePath = () =>
  process.env.CONTENT_STORE_PATH
    ? path.resolve(process.env.CONTENT_STORE_PATH)
    : path.join(process.cwd(), "content.json");

async function readRaw(): Promise<unknown | null> {
  try {
    return JSON.parse(await readFile(storePath(), "utf8"));
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return null; // no store yet — fall back to the seed
    throw err;
  }
}

async function writeRaw(value: Content): Promise<void> {
  const target = storePath();
  await mkdir(path.dirname(target), { recursive: true });
  // Write to a sibling temp file and rename, so a crash mid-write cannot leave
  // a truncated store behind.
  const tmp = `${target}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
  await rename(tmp, target);
}

/* -------------------------------------------------------------------------- */
/* Reads                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Deduplicated per request by React's `cache`, so a page that renders several
 * sections reads the store once.
 */
export const getContent = cache(async (): Promise<Content> => {
  const raw = await readRaw();
  if (raw === null) return defaultContent;

  const parsed = contentSchema.safeParse(raw);
  if (parsed.success) return parsed.data;

  // A hand-edited or partially-migrated store should degrade to the seed rather
  // than crash every page.
  console.error(
    "[store] content.json failed validation, serving defaults instead:",
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
 * That is per-process only — it is not a substitute for real locking if you
 * ever run more than one instance.
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
  return (await readRaw()) !== null;
}

export const contentStorePath = storePath;
