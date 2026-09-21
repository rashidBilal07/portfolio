import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { CursorTrail } from "@/components/CursorTrail";
import { getContent } from "@/lib/store";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-face",
  display: "swap",
});

const siteUrl = process.env.SITE_URL ?? "https://abdulhafeez.dev";

/** Reads the content store so an admin edit updates the title and OG tags too. */
export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getContent();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${profile.name} | ${profile.role}`,
      template: `%s | ${profile.name}`,
    },
    description:
      "Software Quality Assurance Engineer with 3+ years testing mobile Android and iOS applications — manual testing, API testing, regression and cross-platform coverage across 65+ live Google Play apps.",
    keywords: [
      "SQA engineer",
      "Software quality assurance",
      "Mobile app tester",
      `QA engineer ${profile.locationShort}`,
      profile.name,
      "Manual testing",
      "API testing Postman",
      "Android and iOS testing",
    ],
    authors: [{ name: profile.name, url: siteUrl }],
    creator: profile.name,
    openGraph: {
      type: "website",
      url: siteUrl,
      title: `${profile.name} | ${profile.role}`,
      description:
        "3+ years of mobile QA. Manual and API testing across 65+ live Android and iOS applications.",
      siteName: profile.name,
    },
    twitter: {
      card: "summary_large_image",
      title: `${profile.name} | ${profile.role}`,
      description: "SQA engineer — manual, API and regression testing for Android and iOS apps.",
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#07090c" },
    { media: "(prefers-color-scheme: light)", color: "#fbfbfa" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getContent();

  /** Person schema so search engines can render a knowledge panel. */
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.role,
    url: siteUrl,
    email: `mailto:${profile.email}`,
    address: { "@type": "PostalAddress", addressLocality: profile.locationShort },
    sameAs: [profile.github, profile.linkedin].filter(Boolean),
    knowsAbout: ["Software testing", "Quality assurance", "Manual testing", "API testing", "Mobile app testing"],
  };

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Applied before paint so the chosen theme never flashes. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        {/* Scroll reveals start at opacity 0 and are animated in by JS. Without
            JS that would leave a blank page, so force everything visible. */}
        <noscript>
          <style>{`[style*="opacity:0"]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className={`${inter.variable} ${mono.variable}`}>
        {children}
        <CursorTrail />
      </body>
    </html>
  );
}
