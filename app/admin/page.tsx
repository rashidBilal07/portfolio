import type { Metadata } from "next";
import { getContent, contentStorePath, storeExists } from "@/lib/store";
import { AdminShell } from "./AdminShell";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/** Always render fresh — this page is the editor's view of the live store. */
export const dynamic = "force-dynamic";

export default async function AdminPage() {
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
