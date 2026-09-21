import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Projects } from "@/components/Projects";
import {
  Contact,
  Experience,
  Footer,
  Marquee,
  Principles,
  Stack,
  Stats,
} from "@/components/Sections";
import { getContent } from "@/lib/store";

/**
 * Cached indefinitely and invalidated explicitly by the admin endpoints via
 * revalidatePath, so the page is served statically but an edit is live on the
 * next request.
 */
export const revalidate = false;

export default async function Home() {
  const content = await getContent();
  const { profile } = content;

  return (
    <>
      <Nav profile={profile} />
      <main>
        <Hero profile={profile} />
        <Marquee profile={profile} />
        <Stats profile={profile} />
        <Experience experience={content.experience} />
        <Projects projects={content.projects} />
        <Principles principles={content.principles} />
        <Stack
          skillGroups={content.skillGroups}
          certifications={content.certifications}
          education={content.education}
        />
        <Contact profile={profile} />
      </main>
      <Footer profile={profile} />
    </>
  );
}
