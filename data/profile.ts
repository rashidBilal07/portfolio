import type { Profile } from "@/lib/schema";

/**
 * Everything about you that isn't a project, job, or skill.
 * These are the DEFAULTS. Once /admin has saved once, content.json wins.
 *
 * Sourced from Abdul Hafeez's CV. `github` and `playStoreDeveloper` are
 * omitted deliberately — the CV lists neither, and both are optional.
 */

export const profile: Omit<Profile, "terminalLines"> = {
  name: "Abdul Hafeez",
  firstName: "Hafeez",
  role: "Software Quality Assurance (SQA) Engineer",
  roleShort: "SQA Engineer",
  // The big hero statement. Two short lines read better than one long one.
  headline: ["65+ apps tested", "before they shipped."],
  // The phrase in the headline that gets the accent color + underline.
  headlineAccent: "before they shipped",
  /** `**bold**` is rendered as emphasis in the hero. */
  bio: "I'm **Abdul Hafeez**, a detail-oriented SQA engineer with **3+ years** testing mobile **Android and iOS** applications. Manual testing, API testing, regression and cross-platform coverage — run on real devices, in an Agile/Scrum team, alongside developers, designers, product and marketing. **65+ live applications** tested and verified on the Google Play Store.",
  location: "Punjab, Pakistan",
  locationShort: "Punjab, PK",
  email: "hafeezse000@gmail.com",
  phone: "+92 349 4120107",
  linkedin: "https://linkedin.com/in/abdul-hafeez-sqa",
  linkedinHandle: "/in/abdul-hafeez-sqa",
  resumeUrl: "/abdul-hafeez-sqa-engineer.pdf",
  availability: "OPEN TO WORK",
  // Keyed PNG: the white backdrop of avatar.jpg is transparent here, so the
  // --avatar-bg token in globals.css controls the colour behind the portrait.
  avatar: "/avatar.png",

  /** Badges that orbit the portrait in the hero. Keep to 5–6. */
  orbitBadges: [
    "Manual Testing",
    "API / Postman",
    "Android + iOS",
    "Real devices",
    "Punjab, PK",
    "65+ apps tested",
  ],

  /** Scrolling marquee under the hero. */
  marquee: [
    "Manual Testing",
    "Functional Testing",
    "Regression Testing",
    "Black Box Testing",
    "UI/UX Testing",
    "API Testing",
    "Smoke Testing",
    "Sanity Testing",
    "Stress Testing",
    "Monkey Testing",
    "Beta Testing",
    "Ad Verification",
    "Postman",
    "Android Studio",
    "Firebase Test Lab",
    "Samsung Test Lab",
    "Kobiton",
    "Figma Mirror",
    "Agile / Scrum",
  ],

  /** Animated counters. `value` is the number, `suffix` the trailing glyph. */
  stats: [
    { value: 3, suffix: "+", label: "YEARS IN SQA" },
    { value: 65, suffix: "+", label: "LIVE APPS TESTED" },
    { value: 2, suffix: "", label: "PLATFORMS — ANDROID + iOS" },
    { value: 5, suffix: "", label: "APP CATEGORIES COVERED" },
  ],
};

/**
 * The test run that types itself out in the hero.
 * Keep the last line a pass — it's the payoff.
 */
export const terminalLines = [
  "test-run: release-candidate build",
  "> Smoke → Functional → Regression",
  "> Real devices · Android + iOS · API via Postman",
  "PASSED — verified for Play Store release",
];
