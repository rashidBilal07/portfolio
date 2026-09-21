import type { Job } from "@/lib/schema";

/**
 * Newest first.
 *
 * The ITGlobe entry is taken from Abdul Hafeez's CV verbatim. The Terafort
 * US. LLC entry was added afterwards and is not on that CV — its location and
 * responsibilities are a reasonable fit for the same skill set rather than a
 * record of the actual role, so replace the intro and bullets with the real
 * scope. The ITGlobe end date assumes the two roles did not overlap; change
 * `to` back to "PRESENT" if they did.
 */
export const experience: Job[] = [
  {
    company: "Terafort US. LLC",
    title: "Software Quality Assurance Engineer",
    from: "JUL 2026",
    to: "PRESENT",
    location: "United States · Remote",
    intro:
      "QA across the product portfolio: test planning, manual and API testing on real devices, and release verification, working with the team through Jira and ClickUp.",
    bullets: [
      "Own test planning and execution for mobile releases, from test case design through to release sign-off.",
      "Run manual functional, regression and exploratory testing on real Android and iOS devices.",
      "Conduct API testing in Postman, covering error responses, timeouts and edge-case payloads.",
      "Track defects and testing progress in Jira and ClickUp, and report status to the team through Slack and Discord.",
      "Maintain regression suites and testing documentation so coverage is visible rather than assumed.",
      "Verify release builds before deployment and confirm the tested build is the one that ships.",
    ],
    tech: ["Manual Testing", "Postman", "Jira", "ClickUp", "Real Devices", "Regression", "Slack"],
  },
  {
    company: "ITGlobe",
    title: "Software Quality Assurance Engineer",
    from: "JUN 2023",
    to: "JUN 2026",
    location: "Lahore, Pakistan",
    intro:
      "End-to-end QA for mobile Android and iOS applications, working in an Agile/Scrum team and acting as QA owner on several products — from test planning through to verifying the build that goes to the store.",
    bullets: [
      "Perform end-to-end testing for Android and iOS applications using real devices.",
      "Design and execute test plans, test cases and regression suites.",
      "Identify, document and track bugs, improving defect resolution efficiency.",
      "Collaborate with developers, designers, product managers and the marketing team.",
      "Conduct API testing using Postman.",
      "Verify app releases before deployment.",
      "Act as project QA owner on multiple applications, managing testing priorities and release timelines.",
    ],
    tech: [
      "Manual Testing",
      "Postman",
      "Android Studio",
      "Firebase Test Lab",
      "Samsung Test Lab",
      "Kobiton",
      "Agile / Scrum",
    ],
  },
];
