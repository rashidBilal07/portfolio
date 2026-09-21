import type { Certification, Education, Principle, SkillGroup } from "@/lib/schema";

/** Grouped exactly as the CV lists them, plus the platform/process context. */
export const skillGroups: SkillGroup[] = [
  {
    label: "TESTING EXPERTISE",
    items: [
      "Manual Testing",
      "Functional Testing",
      "Regression Testing",
      "Black Box Testing",
      "UI/UX Testing",
      "API Testing",
      "Cross-Browser Testing",
    ],
  },
  {
    label: "TESTING TYPES",
    items: [
      "Smoke Testing",
      "Sanity Testing",
      "Stress Testing",
      "Monkey Testing",
      "Beta Testing",
      "Ad Verification Testing",
    ],
  },
  {
    label: "TOOLS & TECHNOLOGIES",
    items: [
      "Postman",
      "Android Studio",
      "Figma Mirror",
      "Firebase Test Lab",
      "Samsung Test Lab",
      "Kobiton",
      "Slack",
      "Google Sheets",
      "MS Office",
    ],
  },
  {
    label: "PLATFORMS",
    items: [
      "Android (primary)",
      "iOS (moderate)",
      "Real device testing",
      "Cross-platform testing",
      "Google Play Store",
    ],
  },
  {
    label: "PROCESS",
    items: [
      "Agile / Scrum",
      "Test plans",
      "Test case design",
      "Regression suites",
      "Bug documentation & tracking",
      "Release verification",
    ],
  },
  {
    label: "OWNERSHIP",
    items: [
      "Project QA owner",
      "Testing prioritisation",
      "Release timelines",
      "Cross-functional coordination",
    ],
  },
  {
    label: "LANGUAGES",
    items: ["English (Professional)", "Urdu (Native)"],
  },
];

/** None listed on the CV — the section hides itself while this is empty. */
export const certifications: Certification[] = [];

export const education: Education[] = [
  {
    degree: "B.S. Software Engineering",
    school: "University of Lahore, Pakistan",
    years: "2019–2023",
  },
];

export const principles: Principle[] = [
  {
    n: "01",
    title: "Real devices, not just emulators",
    body: "Every app I sign off gets tested on real hardware. Emulators hide the things users actually hit — permission prompts on a specific OEM skin, a notch cropping a layout, performance on a mid-range phone. If it has not run on a real device, it has not been tested.",
  },
  {
    n: "02",
    title: "A bug report is a handover",
    body: "Exact device, OS version, build and the smallest sequence that reproduces it. If a developer has to come back and ask me a question before they can start, the report was not finished. Clear reports are the single biggest lever on resolution time.",
  },
  {
    n: "03",
    title: "Test the layer underneath too",
    body: "The UI is only half the product. I check the API directly in Postman — error responses, empty states, timeouts and bad payloads — because a screen that looks right on a good connection can still fail the moment the back end does something unexpected.",
  },
  {
    n: "04",
    title: "QA belongs in the room, early",
    body: "I work alongside developers, designers, product and marketing rather than at the end of the line. Questions asked while a feature is still being designed are cheap; the same questions asked the day before release are expensive.",
  },
];
