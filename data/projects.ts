/**
 * ADD A NEW APP: copy any object below, change the fields, done.
 * The homepage grid and the /projects/<slug> case-study page both read from here.
 *
 * Screenshots: drop images in /public/screenshots/<slug>/ and reference them as
 * "/screenshots/<slug>/1.jpg". Portrait phone screenshots (1080x1920-ish) look
 * best — landscape marketing graphics get cropped by the phone frames.
 * Icon: /public/icons/<slug>.png at 512x512.
 *
 * Any field marked optional can be left out entirely and the UI adapts.
 *
 * These are QA engagements, drawn from the app categories listed on the CV.
 * `client` is the Google Play developer account that publishes the app.
 * Install / rating / review figures are the public Play Store values.
 * `metrics` describe the testing scope rather than inventing statistics.
 */

import type { Project } from "@/lib/schema";

/* Types live in lib/schema.ts, where they double as runtime validation. */

export const projects: Project[] = [
  {
    slug: "phone-cleaner-ai",
    name: "Phone Cleaner - AI Cleaner",
    summary:
      "A 50M-install cleaner and file manager. The highest-stakes category I test: the app deletes user files, so the priority is proving it never removes something the user wanted to keep.",
    punchline: "Testing an app whose mistakes are irreversible",
    client: "BRAIN TRUST",
    status: "LIVE ON PLAY",
    year: "2023–2026",
    role: "QA Engineer — project QA owner",
    featured: true,
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=myfiles.filemanager.fileexplorer.cleaner",
    installs: "50M+",
    rating: "4.8",
    reviews: "729K",
    icon: "/icons/phone-cleaner-ai.png",
    screenshots: [
      "/screenshots/phone-cleaner-ai/1.jpg",
      "/screenshots/phone-cleaner-ai/2.jpg",
      "/screenshots/phone-cleaner-ai/3.jpg",
      "/screenshots/phone-cleaner-ai/4.jpg",
      "/screenshots/phone-cleaner-ai/5.jpg",
    ],
    tech: [
      "Manual Testing",
      "Real Devices",
      "Regression",
      "Stress Testing",
      "Android Studio",
      "Firebase Test Lab",
    ],
    metrics: [
      { label: "PLATFORMS", value: "Android" },
      { label: "DEVICES", value: "Real devices" },
      { label: "PLAY RATING", value: "4.8" },
      { label: "QA ROLE", value: "Owner" },
    ],
    caseStudy: [
      {
        heading: "Why this one is different",
        body: "A cleaner earns its rating by deleting aggressively and loses it by deleting one wrong file. A crash is recoverable; a deleted photo is not. So the test plan for this app is built around the destructive paths first and the happy path second.",
      },
      {
        heading: "How I test it",
        body: "Testing runs on real devices loaded with real content, because a scan on a clean emulator proves nothing about what the app does to a phone holding a year of photos, chat media and app caches.",
        points: [
          "Seed a device with known content across DCIM, downloads, media folders and app caches, then verify after a clean that everything outside the junk categories is still present.",
          "Interrupt the destructive paths deliberately — kill the app mid-delete, revoke storage permission halfway, run with storage nearly full — and confirm it never leaves a half-finished state.",
          "Cover storage variations: internal, SD card, and files currently held open by another app.",
          "Stress and monkey testing on long scan runs, to surface crashes and ANRs a short manual pass never reaches.",
        ],
      },
      {
        heading: "Release sign-off",
        body: "Every release candidate gets a full regression pass plus focused exploratory testing on whatever changed, and I verify the build that is actually going to the store rather than an earlier one. As QA owner I hold the release until the destructive paths are clean.",
      },
    ],
  },
  {
    slug: "cast-for-chromecast",
    name: "Cast for Chromecast - TV Cast",
    summary:
      "A 10M-install screen-mirroring and casting app. The hardest category to test, because the failure usually lives in the network between two devices rather than in the app itself.",
    punchline: "Defects that only exist on someone else's Wi-Fi",
    client: "SAVE STATUS",
    status: "LIVE ON PLAY",
    year: "2023–2026",
    role: "QA Engineer — manual + API testing",
    featured: true,
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=screenmirroring.tvcast.smartview.miracast.chromecast",
    installs: "10M+",
    rating: "4.0",
    reviews: "82K",
    icon: "/icons/cast-for-chromecast.png",
    screenshots: [
      "/screenshots/cast-for-chromecast/1.jpg",
      "/screenshots/cast-for-chromecast/2.jpg",
      "/screenshots/cast-for-chromecast/3.jpg",
      "/screenshots/cast-for-chromecast/4.jpg",
      "/screenshots/cast-for-chromecast/5.jpg",
    ],
    tech: [
      "Manual Testing",
      "Real Devices",
      "Cross-Platform",
      "Postman",
      "Regression",
      "Beta Testing",
    ],
    metrics: [
      { label: "PLATFORMS", value: "Android + iOS" },
      { label: "RECEIVERS", value: "Real TVs" },
      { label: "API TESTING", value: "Postman" },
      { label: "PLAY RATING", value: "4.0" },
    ],
    caseStudy: [
      {
        heading: "Why this one is different",
        body: "Casting is the definition of a works-on-my-machine problem. The app can pass every check in the office and still collect reviews saying it will not find the TV, because the variable was never the app alone — it is the receiver brand, the router and the network the user is on.",
      },
      {
        heading: "How I test it",
        body: "Against real receivers on real networks rather than a mocked one, because this class of defect cannot be reproduced any other way.",
        points: [
          "Test against actual TVs and casting hardware instead of a simulated receiver, covering different brands and generations.",
          "Vary the network deliberately: different routers, 2.4GHz versus 5GHz, guest networks, and phone and TV on separate access points.",
          "Interrupt an active cast — drop Wi-Fi, switch to mobile data, power the receiver off mid-playback — and check the app recovers instead of hanging.",
          "Verify discovery from a cold start, since most complaints are about the TV never appearing in the list at all.",
        ],
      },
      {
        heading: "Cross-platform",
        body: "This category is tested on both Android and iOS, which is where cross-platform differences show up most: permission models and local-network discovery behave differently enough that a fix on one platform cannot be assumed on the other.",
      },
    ],
  },
  {
    slug: "applock-fingerprint",
    name: "AppLock - Fingerprint App Lock",
    summary:
      "A 5M-install app locker. A security utility where the outcome is binary: either the lock holds on every route into the protected app, or it does not.",
    punchline: "A lock is only as good as its weakest bypass",
    client: "SOLUTION10",
    status: "LIVE ON PLAY",
    year: "2023–2026",
    role: "QA Engineer — manual + regression",
    featured: true,
    playStoreUrl: "https://play.google.com/store/apps/details?id=ai.fingerprint.lock.app.lock",
    installs: "5M+",
    rating: "4.7",
    reviews: "21.5K",
    icon: "/icons/applock-fingerprint.png",
    screenshots: [
      "/screenshots/applock-fingerprint/1.jpg",
      "/screenshots/applock-fingerprint/2.jpg",
      "/screenshots/applock-fingerprint/3.jpg",
      "/screenshots/applock-fingerprint/4.jpg",
      "/screenshots/applock-fingerprint/5.jpg",
    ],
    tech: [
      "Manual Testing",
      "Black Box Testing",
      "Real Devices",
      "Regression",
      "UI/UX Testing",
      "Kobiton",
    ],
    metrics: [
      { label: "PLATFORMS", value: "Android" },
      { label: "BIOMETRICS", value: "Real devices" },
      { label: "FOCUS", value: "Bypass paths" },
      { label: "PLAY RATING", value: "4.7" },
    ],
    caseStudy: [
      {
        heading: "Why this one is different",
        body: "Most functional bugs degrade an experience. On a lock app a single missed route straight past the lock screen makes the whole product pointless, so the cases are written from the attacker side rather than the happy path.",
      },
      {
        heading: "How I test it",
        body: "Systematically, through every entry point into a protected app rather than just the icon on the home screen.",
        points: [
          "Enter the locked app from every route — launcher, recents, notification, share sheet, deep link and widget — and confirm the lock appears each time.",
          "Test the biometric paths on real hardware: enrolled fingerprint, wrong fingerprint, changed enrolment, and fallback to PIN or pattern after failed attempts.",
          "Cover the lifecycle edges — reboot, app update, force stop, cleared cache, background timeout — where the lock state can silently reset.",
          "Verify the lock survives the obvious workarounds, including switching users and removing the app from recents.",
        ],
      },
      {
        heading: "Regression",
        body: "Because the risk is concentrated and the surface is stable, this app has a tight regression suite that runs in full on every release rather than being sampled. Running it costs far less than one bypass reaching production.",
      },
    ],
  },
  {
    slug: "qr-code-reader",
    name: "QR Code Reader・Barcode Scanner",
    summary:
      "A 5M-install scanner rated 4.9. A camera-dependent app, which means the real test conditions are physical — lighting, angle, distance and print quality — not just taps on a screen.",
    punchline: "Lab conditions hide every scanner defect",
    client: "APP CRAZE",
    status: "LIVE ON PLAY",
    year: "2023–2026",
    role: "QA Engineer — manual + API testing",
    featured: true,
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=qrcodescanner.barcodereader.scanner.free",
    installs: "5M+",
    rating: "4.9",
    reviews: "17.6K",
    icon: "/icons/qr-code-reader.png",
    screenshots: [
      "/screenshots/qr-code-reader/1.jpg",
      "/screenshots/qr-code-reader/2.jpg",
      "/screenshots/qr-code-reader/3.jpg",
      "/screenshots/qr-code-reader/4.jpg",
      "/screenshots/qr-code-reader/5.jpg",
    ],
    tech: [
      "Manual Testing",
      "Real Devices",
      "Functional Testing",
      "Ad Verification",
      "Postman",
      "Samsung Test Lab",
    ],
    metrics: [
      { label: "PLATFORMS", value: "Android" },
      { label: "CAMERA TESTING", value: "Physical" },
      { label: "ADS", value: "Verified" },
      { label: "PLAY RATING", value: "4.9" },
    ],
    caseStudy: [
      {
        heading: "Why this one is different",
        body: "A scanner tested indoors on a clean code printed at full size passes every time. Users scan creased receipts, screens at an angle, faded labels and codes in bad light — so the interesting test cases are physical objects, not test data.",
      },
      {
        heading: "How I test it",
        body: "With real codes in real conditions, across a spread of camera hardware.",
        points: [
          "Scan a range of code types and qualities — clean prints, damaged and creased codes, codes on a screen, very small and very large, and partially obscured.",
          "Vary the physical conditions deliberately: low light, harsh backlight, steep angles, distance and movement.",
          "Test across camera hardware from low-end to flagship, since autofocus behaviour is where cheaper devices fail first.",
          "Verify what happens after a scan — result parsing, the action taken for each code type, and the history list.",
        ],
      },
      {
        heading: "Ads and API",
        body: "Free utilities in this category are ad-supported, so ad verification is part of the pass: placements load, do not block the scanning surface, and behave correctly on a poor connection. Back-end calls are checked directly in Postman, including error and timeout responses.",
      },
    ],
  },
  {
    slug: "pdf-reader-viewer",
    name: "PDF Reader App - PDF Viewer",
    summary:
      "A 10M-install document reader. A reader is only as good as the worst file a user opens, so the test input matters more than the test steps.",
    punchline: "The test case is the file, not the tap",
    client: "APP CRAZE",
    status: "LIVE ON PLAY",
    year: "2023–2026",
    role: "QA Engineer — manual + regression",
    playStoreUrl: "https://play.google.com/store/apps/details?id=pdf.pdfreader.pdfviewer.pdfeditor",
    installs: "10M+",
    rating: "4.5",
    reviews: "102K",
    icon: "/icons/pdf-reader-viewer.png",
    screenshots: [
      "/screenshots/pdf-reader-viewer/1.jpg",
      "/screenshots/pdf-reader-viewer/2.jpg",
      "/screenshots/pdf-reader-viewer/3.jpg",
      "/screenshots/pdf-reader-viewer/4.jpg",
      "/screenshots/pdf-reader-viewer/5.jpg",
    ],
    tech: ["Manual Testing", "Regression", "Real Devices", "Stress Testing", "Android Studio"],
    metrics: [
      { label: "PLATFORMS", value: "Android" },
      { label: "TEST INPUT", value: "File variety" },
      { label: "FOCUS", value: "Large files" },
      { label: "PLAY RATING", value: "4.5" },
    ],
    caseStudy: [
      {
        heading: "Why this one is different",
        body: "Testing a reader with a handful of clean, well-formed PDFs proves almost nothing, because a clean PDF is the one category of file that never fails. The complaints are always about one specific document that will not open.",
      },
      {
        heading: "How I test it",
        body: "By building the input set first and treating each file as a case.",
        points: [
          "Open a deliberately awkward set of documents: password-protected, very large scans, files of hundreds of pages, non-Latin and right-to-left text, embedded images, and output from different generators.",
          "Check the reading surface properly on each — scroll, zoom, rotate, search and jump — rather than confirming the first page renders.",
          "Watch memory and responsiveness on large scanned documents on mid-range devices, where out-of-memory failures appear first.",
          "Open documents from where users actually open them: a file manager, email, a chat app and cloud storage, each of which hands the file over differently.",
        ],
      },
      {
        heading: "Regression",
        body: "The awkward-file set is reused as a regression pack on every release, so a rendering fix for one document type cannot quietly break another.",
      },
    ],
  },
  {
    slug: "recover-deleted-messages",
    name: "Recover Deleted Messages",
    summary:
      "A 5M-install message-recovery utility built on a notification listener. Sensitive by nature, and dependent on a background service that several Android skins actively kill.",
    punchline: "A background service is only as good as the OEM allows",
    client: "SOLUTION10",
    status: "LIVE ON PLAY",
    year: "2023–2026",
    role: "QA Engineer — manual + regression",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=restore.deleted.messages.recoveryapp",
    installs: "5M+",
    rating: "4.6",
    reviews: "71.7K",
    icon: "/icons/recover-deleted-messages.png",
    screenshots: [
      "/screenshots/recover-deleted-messages/1.jpg",
      "/screenshots/recover-deleted-messages/2.jpg",
      "/screenshots/recover-deleted-messages/3.jpg",
      "/screenshots/recover-deleted-messages/4.jpg",
      "/screenshots/recover-deleted-messages/5.jpg",
    ],
    tech: ["Manual Testing", "Real Devices", "Regression", "Beta Testing", "Firebase Test Lab"],
    metrics: [
      { label: "PLATFORMS", value: "Android" },
      { label: "FOCUS", value: "Background" },
      { label: "DEVICES", value: "OEM skins" },
      { label: "PLAY RATING", value: "4.6" },
    ],
    caseStudy: [
      {
        heading: "Why this one is different",
        body: "The feature depends on a service staying alive in the background for hours. On stock Android that mostly works; on several popular OEM skins the system kills it aggressively, so the app silently misses messages on exactly the devices most common in this market.",
      },
      {
        heading: "How I test it",
        body: "With long runs on real devices from the manufacturers that cause the problem.",
        points: [
          "Run multi-hour capture sessions on real handsets rather than short functional passes, since the failure only appears once the service has been idle for a while.",
          "Test across manufacturer skins known for aggressive battery management, with and without the battery-optimisation exemption granted.",
          "Cover the lifecycle events that break listeners — reboot, force stop, app update and cleared cache — and confirm capture resumes.",
          "Check the sensitive-data surface: what is stored locally, and that uninstalling genuinely removes it.",
        ],
      },
      {
        heading: "Release verification",
        body: "Because the defect mode is silent — nothing crashes, messages simply do not appear — verification means confirming captures actually happened after a long run, not just that the app opened without errors.",
      },
    ],
  },
  {
    slug: "photo-translator",
    name: "Photo Translator All Languages",
    summary:
      "A 5M-install camera translator. Two hard surfaces stacked: OCR from a live camera, and a translation back end that has to be tested directly rather than through the UI.",
    punchline: "Where the camera ends and the API begins",
    client: "APP CRAZE",
    status: "LIVE ON PLAY",
    year: "2023–2026",
    role: "QA Engineer — manual + API testing",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=photo.translate.language.translator.cameratranslation",
    installs: "5M+",
    rating: "3.4",
    reviews: "27.3K",
    icon: "/icons/photo-translator.png",
    screenshots: [
      "/screenshots/photo-translator/1.jpg",
      "/screenshots/photo-translator/2.jpg",
      "/screenshots/photo-translator/3.jpg",
      "/screenshots/photo-translator/4.jpg",
      "/screenshots/photo-translator/5.jpg",
    ],
    tech: ["Manual Testing", "Postman", "API Testing", "Real Devices", "UI/UX Testing"],
    metrics: [
      { label: "PLATFORMS", value: "Android" },
      { label: "API TESTING", value: "Postman" },
      { label: "FOCUS", value: "OCR + network" },
      { label: "PLAY RATING", value: "3.4" },
    ],
    caseStudy: [
      {
        heading: "Why this one is different",
        body: "When a translation comes back wrong, the interesting question is which layer failed — the camera and OCR, or the translation service behind it. Testing only through the UI cannot separate the two, which is where API testing earns its place.",
      },
      {
        heading: "How I test it",
        body: "By testing the two layers independently, then together.",
        points: [
          "Exercise OCR on real physical text: printed pages, signs, handwriting, low contrast, curved surfaces and mixed scripts.",
          "Hit the translation endpoints directly in Postman — valid requests, unsupported language pairs, empty and oversized payloads, timeouts and error codes.",
          "Test against a poor or dropped connection, to confirm the app surfaces a real message instead of failing silently or hanging.",
          "Check language coverage and the switching flow, including right-to-left languages where the layout is most likely to break.",
        ],
      },
      {
        heading: "Why the rating matters here",
        body: "This app sits lower than its siblings, and that is useful context rather than something to hide: the review themes point at accuracy and network handling, which is exactly where the API-level testing is aimed.",
      },
    ],
  },
  {
    slug: "mp3-converter",
    name: "MP3 Converter - Video to MP3",
    summary:
      "A 5M-install media converter. The output file is the deliverable, so verification means checking what actually came out rather than whether the progress bar reached the end.",
    punchline: "A finished conversion is not a correct one",
    client: "SOLUTION10",
    status: "LIVE ON PLAY",
    year: "2023–2026",
    role: "QA Engineer — manual + regression",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=mp3converter.convertvideotomp3.audioconverter",
    installs: "5M+",
    rating: "4.4",
    reviews: "61.7K",
    icon: "/icons/mp3-converter.png",
    screenshots: [
      "/screenshots/mp3-converter/1.jpg",
      "/screenshots/mp3-converter/2.jpg",
      "/screenshots/mp3-converter/3.jpg",
      "/screenshots/mp3-converter/4.jpg",
      "/screenshots/mp3-converter/5.jpg",
    ],
    tech: ["Manual Testing", "Real Devices", "Regression", "Stress Testing", "Android Studio"],
    metrics: [
      { label: "PLATFORMS", value: "Android" },
      { label: "VERIFIED", value: "Output file" },
      { label: "FOCUS", value: "Long jobs" },
      { label: "PLAY RATING", value: "4.4" },
    ],
    caseStudy: [
      {
        heading: "Why this one is different",
        body: "It is easy to pass a converter by watching the progress bar complete. That says nothing about whether the audio is intact, the duration is right, or the metadata survived — all of which the user notices immediately and the tester does not, unless they check.",
      },
      {
        heading: "How I test it",
        body: "By verifying the artefact, and by attacking the long-running job.",
        points: [
          "Check each output against the source: duration, bitrate, metadata, and that the audio plays end to end without artefacts.",
          "Convert a spread of input formats, including long videos, very short clips, unusual containers and files with no audio track at all.",
          "Interrupt conversions deliberately — background the app, lock the screen, take a call, run low on storage — and confirm it either completes or fails cleanly rather than leaving a corrupt file.",
          "Verify where the output lands and that it is visible to other apps and the system media scanner.",
        ],
      },
      {
        heading: "Regression",
        body: "The input set is kept and rerun each release, because codec and library changes are exactly the kind of update that silently changes output quality while every screen still looks correct.",
      },
    ],
  },
  {
    slug: "cast-to-tv-screen-mirroring",
    name: "Cast to TV - Screen Mirroring",
    summary:
      "A second 5M-install casting app on a different developer account, sharing the failure surface of the category — discovery, network conditions and receiver compatibility.",
    punchline: "Same category, different codebase, same hard parts",
    client: "APP CRAZE",
    status: "LIVE ON PLAY",
    year: "2023–2026",
    role: "QA Engineer — manual testing",
    playStoreUrl: "https://play.google.com/store/apps/details?id=ai.chatbot.alpha.chatapp",
    installs: "5M+",
    rating: "4.9",
    reviews: "43.8K",
    icon: "/icons/cast-to-tv-screen-mirroring.png",
    screenshots: [
      "/screenshots/cast-to-tv-screen-mirroring/1.jpg",
      "/screenshots/cast-to-tv-screen-mirroring/2.jpg",
      "/screenshots/cast-to-tv-screen-mirroring/3.jpg",
      "/screenshots/cast-to-tv-screen-mirroring/4.jpg",
      "/screenshots/cast-to-tv-screen-mirroring/5.jpg",
    ],
    tech: ["Manual Testing", "Real Devices", "Functional Testing", "Regression", "Ad Verification"],
    metrics: [
      { label: "PLATFORMS", value: "Android" },
      { label: "RECEIVERS", value: "Real TVs" },
      { label: "ADS", value: "Verified" },
      { label: "PLAY RATING", value: "4.9" },
    ],
    caseStudy: [
      {
        heading: "Why this one is different",
        body: "Testing two apps in the same category on different accounts is useful: the same network and receiver setup applies to both, but the implementations differ, so a defect found in one is a hypothesis worth checking in the other rather than an assumption.",
      },
      {
        heading: "How I test it",
        body: "Against the same physical receiver and network setup used for the other casting app, so the results are comparable.",
        points: [
          "Discovery and connection across real TV brands and casting hardware.",
          "Mirroring and media playback under varied network conditions, including weak signal and mid-session drops.",
          "Orientation, background and interruption handling during an active cast — an incoming call or a locked screen should not end the session badly.",
          "Ad verification on the free tier: placements load and do not interfere with an active cast.",
        ],
      },
    ],
  },
  {
    slug: "funny-prank-sounds",
    name: "Funny Prank Sounds: Fart, Horn",
    summary:
      "A 5M-install entertainment app. Simple on the surface, which is exactly why the defects hide in audio behaviour, interruptions and the ad layer rather than in the main flow.",
    punchline: "Simple apps fail at the edges, not the middle",
    client: "BLUELINE. TECH",
    status: "LIVE ON PLAY",
    year: "2023–2026",
    role: "QA Engineer — manual testing",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=funny.prank.sounds.airhorn.haircut.fart",
    installs: "5M+",
    rating: "4.6",
    reviews: "9.68K",
    icon: "/icons/funny-prank-sounds.png",
    screenshots: [
      "/screenshots/funny-prank-sounds/1.jpg",
      "/screenshots/funny-prank-sounds/2.jpg",
      "/screenshots/funny-prank-sounds/3.jpg",
      "/screenshots/funny-prank-sounds/4.jpg",
      "/screenshots/funny-prank-sounds/5.jpg",
    ],
    tech: ["Manual Testing", "Real Devices", "Ad Verification", "Monkey Testing", "UI/UX Testing"],
    metrics: [
      { label: "PLATFORMS", value: "Android" },
      { label: "FOCUS", value: "Audio + ads" },
      { label: "DEVICES", value: "Real devices" },
      { label: "PLAY RATING", value: "4.6" },
    ],
    caseStudy: [
      {
        heading: "Why this one is different",
        body: "The main flow is one tap and a sound plays, so it is tempting to pass it in five minutes. The real risks sit around that tap: audio focus, interruptions, and an ad layer that carries most of the revenue and most of the complaints.",
      },
      {
        heading: "How I test it",
        body: "Around the edges of a deliberately simple interaction.",
        points: [
          "Audio focus behaviour against other apps — music playing, an incoming call, a notification sound, headphones connected and removed mid-playback.",
          "Rapid and repeated triggering, plus monkey testing, to surface crashes from overlapping playback.",
          "Ad verification: placements load, frequency is as intended, and dismissing an ad returns cleanly to the app rather than trapping the user.",
          "Output paths including speaker, headphones, Bluetooth speakers, and silent or vibrate mode.",
        ],
      },
    ],
  },
];
