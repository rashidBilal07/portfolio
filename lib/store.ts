import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { get, head, put } from "@vercel/blob";
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
 * Vercel Blob — used whenever the project is linked to a Blob store. This is
 *   what makes /admin work in production: Vercel's runtime filesystem is
 *   read-only and not shared between invocations, so writing a file there
 *   fails with EROFS and would not persist even if it succeeded.
 *
 * Local filesystem — used otherwise, so `next dev` needs no token and no
 *   network. Also correct for a VPS or a container with a mounted volume.
 *
 * To move somewhere else, replace `readRaw` and `writeRaw`. Nothing else in
 * the app touches storage.
 * ---------------------------------------------------------------------------
 */

/** Object key inside the Blob store. Stable, so there is exactly one document. */
const BLOB_KEY = "content.json";

/**
 * Vercel sets BLOB_STORE_ID when a store is *connected* to the project (the
 * OIDC path, which is the default) and BLOB_READ_WRITE_TOKEN when the store is
 * *created*. Either one means we should be talking to Blob, so check both —
 * keying off only the token would silently fall back to the filesystem on an
 * OIDC-only project and every save would fail.
 *
 * The SDK resolves the actual credential itself, preferring OIDC, so nothing
 * here needs to pass a token explicitly.
 */
const usingBlob = () =>
  Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);

/**
 * A store's access mode is fixed at creation and cannot be changed later.
 * Private is the right default here: the document is only ever read by the
 * server, and private reads can be made strongly consistent. Set
 * BLOB_ACCESS=public only if the store was created as a public one.
 */
const BLOB_ACCESS: "private" | "public" =
  process.env.BLOB_ACCESS === "public" ? "public" : "private";

const filePath = () =>
  process.env.CONTENT_STORE_PATH
    ? path.resolve(process.env.CONTENT_STORE_PATH)
    : path.join(process.cwd(), "content.json");

/* -------------------------------------------------------------------------- */
/* Backends                                                                   */
/* -------------------------------------------------------------------------- */

/** True for "the blob does not exist yet", as opposed to a real failure. */
function isNotFound(err: unknown): boolean {
  const name = (err as { name?: string })?.name ?? "";
  const msg = String((err as { message?: string })?.message ?? err);
  return /BlobNotFound/i.test(name) || /not.?found|does not exist/i.test(msg);
}

async function readBlob(): Promise<unknown | null> {
  if (BLOB_ACCESS === "private") {
    // useCache:false guarantees we see the write we just made. Without it a
    // save can appear to do nothing for up to a minute while the CDN copy
    // expires.
    let res;
    try {
      res = await get(BLOB_KEY, { access: "private", useCache: false });
    } catch (err) {
      if (isNotFound(err)) return null;
      throw err;
    }
    if (!res || res.statusCode !== 200 || !res.stream) return null;
    const text = await new Response(res.stream as unknown as ReadableStream).text();
    return JSON.parse(text);
  }

  // Public store: the blob is fetched straight from the CDN, so the URL needs
  // a cache-buster keyed on the upload time or a save looks like a no-op.
  let meta;
  try {
    meta = await head(BLOB_KEY);
  } catch (err) {
    if (isNotFound(err)) return null;
    throw err;
  }
  const stamp = new Date(meta.uploadedAt).getTime();
  const res = await fetch(`${meta.url}?v=${stamp}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`[store] blob fetch failed: ${res.status}`);
  return res.json();
}

async function writeBlob(value: Content): Promise<void> {
  await put(BLOB_KEY, JSON.stringify(value, null, 2), {
    access: BLOB_ACCESS,
    addRandomSuffix: false, // one stable object rather than a new one per save
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0,
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
  return usingBlob() ? `Vercel Blob (${BLOB_ACCESS}) · ${BLOB_KEY}` : filePath();
}
