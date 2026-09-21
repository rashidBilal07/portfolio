import type { Job } from "@/lib/schema";

/** Newest first. Sourced from Abdul Hafeez's CV. */
export const experience: Job[] = [
  {
    company: "ITGlobe",
    title: "Software Quality Assurance Engineer",
    from: "JUN 2023",
    to: "PRESENT",
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
