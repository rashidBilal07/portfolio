import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { getContent, contentStorePath, storeExists } from "@/lib/store";
import { AdminShell } from "./AdminShell";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/** Always render fresh — this page is the editor's view of the live store. */
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // Defence in depth, matching the API routes. Middleware already gates this
  // path, but CVE-2025-29927 showed that a middleware bypass must not be the
  // only thing standing between an anonymous request and the editor.
  const jar = await cookies();
  if (!(await verifySession(jar.get(SESSION_COOKIE)?.value))) {
    redirect("/admin/login");
  }

  const content = await getContent();
  const usingStore = await storeExists();

  return (
    <AdminShell
      initialContent={content}
      storePath={contentStorePath()}
      usingStore={usingStore}
    />
  );
}
