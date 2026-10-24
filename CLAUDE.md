# Rockson Kwesi Owusu — Portfolio Build Plan

You are building Rockson's personal portfolio. Read this whole file before writing code.
Work phase by phase. Stop at the end of each phase, show what you built (screenshots if you can), and wait for "continue".

---

## 1. Who this is for

**Rockson Kwesi Owusu** (GitHub: `rocksonowusu`), based in Ho, Volta Region, Ghana.

- Developer working across **web, mobile, IoT (ESP32 / MicroPython) and machine learning**.
- **BTech ICT (Honours), with Distinction**, Ho Technical University, 2021–2025. (Certificate stays private: never publish a scan.)
- Teaching at **Ho Technical University (HTU)**, Computer Science Department, Nov 2025 – Oct 2026 (National Service).
  - Teaches C++, Python, Android development in Java,  and Computer Literacy (Microsoft Office).
  - Teaches Computer Literacy across non-CS programmes too: Tourism, Biomedical Eng., Mechanical Eng., Hospitality, Marketing, Building Technology.
  - Supported student thesis and project work.
- Also designs: logos, SVG assets, developer wallpapers (Behance).
- Links: GitHub https://github.com/rocksonowusu · LinkedIn https://www.linkedin.com/in/owusu-rockson-a57629340/ · Behance https://www.behance.net/Rockson_Owusu

**Audience:** recruiters, universities and clients in Ghana and abroad.
**Primary job of the site:** show work that runs in the real world (live systems, real hardware), and show that he also teaches it.

---

## 2. Stack (decided — do not change without asking)

| Concern           | Choice                                                                                               |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| Framework         | **Next.js (App Router), TypeScript**, latest stable                                            |
| Styling           | Tailwind CSS (latest stable) + CSS variables for tokens                                              |
| Scroll animation  | **GSAP + ScrollTrigger + SplitText** (all free now)                                            |
| Smooth scroll     | **Lenis**, synced to ScrollTrigger                                                             |
| Component motion  | **Motion** (`motion/react`) for hover, layout and presence                                   |
| Route transitions | **GSAP sheet with loader** (see M10). `next-view-transitions` was dropped: it froze the page while loading |
| Images            | `next/image` (AVIF/WebP) + `sharp` build script + blur placeholders                              |
| Content           | Typed TS files in `src/content/` (no CMS)                                                          |
| Hosting           | **Vercel** (GitHub repo → Vercel import), `@vercel/analytics`, `next/og` for share images |

Why: Next.js is native to Vercel, image optimisation is built in (critical for an image-heavy site), and GSAP is the strongest tool for scroll-driven sequences.

---

## 3. Design direction: "Paper & Ink"

Brief from Rockson: **black and white, minimal black, plenty of different shades of white. Image-heavy, animation-heavy, transition-heavy.**

### Concept

The site is a stack of white sheets of paper. Every section is a slightly different white, and sections **slide over each other** as you scroll, like sheets being laid on a desk. Black is **ink**: text, the cursor, thin lines, and one full black sheet at the very end (contact). Images **"develop"** like darkroom prints: they start as blank, overexposed white and resolve into the photo as they enter view.

The memorable thing = the **developing images + sliding paper sheets**. Everything else stays quiet.

### Colour tokens (cool, neutral whites — NOT cream)

```
--ink:      #000000   /* true black: type, cursor, final sheet */
--paper:    #FFFFFF   /* brightest sheet */
--chalk:    #F6F7F7
--bone:     #ECEDED
--linen:    #E1E3E3
--haze:     #CDD0D0   /* borders, dividers, image placeholders */
--graphite: #5F6262   /* secondary text (passes contrast on all whites) */
```

Alternate section backgrounds through paper → chalk → bone → linen so every sheet edge is visible. No other colours. Project screenshots are shown **greyscale at rest** and transition to full colour on hover/focus (desktop) or when centred in view (mobile).

### Type

- **One family: Archivo (variable, `wght` + `wdth` axes)** via `next/font/google`.
- The width axis is the type treatment: the hero name animates from condensed to expanded on load and responds to scroll. Project titles stretch slightly on hover.
- Scale (fluid with `clamp`): display 12vw max ~200px · h1 64 · h2 40 · h3 26 · body 18 / line-height 1.6 · small 15.
- Body line length under 72 characters. Sentence case everywhere.

### Avoid (these read as templated)

- ALL-CAPS tracked eyebrow labels above headings
- Monospace data labels, `A · B · C` meta strings, `→` appended to every link
- Identical rounded cards with the same grey shadow
- Numbered `01 / 02 / 03` markers (only use numbers for real sequences, e.g. the timeline)
- Accenting one word in a headline with a different colour or italic
- Fade-and-slide-up on every section (use the paper/develop system instead)

### Layout

Left-aligned, asymmetric 12-column grid, generous whitespace. Images bleed off the grid edge.

```
HOME
┌──────────────────────────────────────────┐
│ [preloader: name develops, <1.6s]        │
├──────────────────────────────────────────┤ paper
│ ROCKSON KWESI OWUSU (huge, wdth anim)    │
│              ┌────────────┐              │
│ one-line     │ B&W cutout │              │
│ intro        │  portrait  │              │
│              └────────────┘              │
├──────────────────────────────────────────┤ chalk (slides over)
│ FEATURED: HTU Timetabling Suite          │
│ pinned: screens change as you scroll,    │
│ figures + credits beside them            │
├──────────────────────────────────────────┤ bone
│ WORK: horizontal pinned gallery          │
│ [img][img][img][img] → filter by kind    │
├──────────────────────────────────────────┤ linen
│ TEACHING: courses + programmes           │
├──────────────────────────────────────────┤ chalk
│ LAB: in progress + experiments + design  │
├──────────────────────────────────────────┤ INK (black sheet)
│ CONTACT: huge white type, links          │
└──────────────────────────────────────────┘
```

---

## 4. Motion system

Respect `prefers-reduced-motion`: everything below falls back to instant or simple opacity changes. Animate only `transform`, `opacity`, `clip-path` and `filter` (no layout properties).

| #   | Effect                             | Where                 | Notes                                                                                                                                                                           |
| --- | ---------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1  | **Preloader**                | first visit, landing on `/` only (deep links skip it, for LCP) | Name develops from white (blur + contrast), then the sheet lifts away. Skip if `sessionStorage` says already seen. Max 1.6s.                                                  |
| M2  | **Paper stacking**           | all home sections     | Each section is `position: sticky` and the next sheet slides over with a soft edge shadow. GSAP ScrollTrigger.                                                                |
| M3  | **Develop-in images**        | every image           | Starts at `filter: brightness(2) contrast(0.4) blur(8px)` + white overlay, resolves when entering view.                                                                       |
| M4  | **Hero type**                | hero name             | SplitText chars, `wdth` animates 62 → 125 on load; scroll slightly compresses it.                                                                                            |
| M5  | **Featured pinned sequence** | HTU Timetabling Suite | Section pins; screenshots crossfade/clip-reveal as you scroll; text panels swap in sync.                                                                                        |
| M6  | **Horizontal gallery**       | Work                  | Vertical scroll drives horizontal track (pinned). Desktop only; mobile = vertical snap list.                                                                                    |
| M7  | **Custom cursor**            | desktop               | Small black dot; over images grows into a circle showing "View"; `mix-blend-mode: difference`. Hidden on touch.                                                               |
| M8  | **Hover image trail**        | /work index list      | Hovering a project row shows its screenshots following the cursor.                                                                                                              |
| M9  | **Magnetic links**           | nav, contact links    | Small pull toward cursor.                                                                                                                                                       |
| M10 | **Route transition**         | all pages             | GSAP sheet (decided 2026-10-24, replaces View Transitions, which froze the page while the next route loaded): on click a paper sheet slides up with the destination name developing and a progress line; the route is prefetched meanwhile and swapped once covered; a clicked project image flies onto the sheet and lands on the case-study cover (`[data-cover-target]`). Reduced motion: the sheet fades. |
| M11 | **Scroll progress**          | case studies          | 1px ink line at top.                                                                                                                                                            |
| M12 | **Marquee**                  | tech stack strip      | Slow, pauses on hover.                                                                                                                                                          |

Keep everything 60fps on a mid-range Android phone. Test on a throttled profile.

---

## 5. Pages & routes

- `/`: home (sections in §3 layout)
- `/work`: all projects, filter by kind (Web · Mobile · IoT · AI), list view with hover trail (M8) + grid toggle
- `/work/[slug]`: case study (template in §7)
- `/about`: story, teaching, timeline, design work, CV download (PDF, when provided)
- `/not-found`: custom 404 in the same style
- No separate `/contact` page; the black contact sheet is a footer on every page

Nav: fixed, minimal: name (home link), Work, About, Contact (scrolls to footer). Becomes a full-screen paper overlay menu on mobile.

---

## 6. Content (`src/content/projects.ts`)

Use ONLY these facts. Anything marked **TODO** → ask Rockson, never invent.

```ts
type Project = {
  slug: string; title: string; kind: ('Web'|'Mobile'|'IoT'|'AI')[];
  summary: string; role: string; stack: string[]; status: 'Live'|'Completed'|'In progress';
  links?: { live?: string; repo?: string }; credits?: { name: string; role: string }[];
  figures?: { value: string; label: string }[]; images: string; featured?: boolean;
}
```

1. **HTU Timetabling Suite** (`htu-timetabling-suite`) · FEATURED

   - University timetable management system, live at Ho Technical University.
   - Generates a whole semester; lecturers request changes and the system shows slots that fit; drag-to-swap sessions with clash checks; free-room finder; Google sign-in with HTU accounts; student timetable on the phone; push reminder 30 minutes before class; daily schedule emails.
   - Stack: React (Vite), FastAPI, MySQL, hosted on cPanel. Live: https://tts.htu.edu.gh
   - Figures: **over 1,000 sessions placed (show as "1,000+") · 0 clashes**. Old process took **weeks** (manual). (Rockson, 2026-10-24: say "over 1000", not an exact count.)
   - Credits (must appear): Rockson Kwesi Owusu (developer), **Kassim Abdulai Junior** (co-developer), **Carlos Ankora** (project supervisor; Rockson's former lecturer), **Ho Technical University**.
   - Assets: landing pages, auth, admin workspace screenshots + walkthrough `.mp4`.
2. **CurrentWatch** (`currentwatch`)

   - End-to-end IoT system that monitors electrical current: ESP32 firmware (MicroPython) feeding a live dashboard + mobile app. Final-year project.
   - Role: lead developer, built the whole working system.
   - Credits: **Atisu Zanetor Susan** (project lead, documentation), **Godson Favour** (design).
   - Repos: https://github.com/rocksonowusu/CurrentWatchHardware · https://github.com/rocksonowusu/CurrentWatchFrontend
   - Assets: 29 usable phone screenshots (2 delivered files are corrupt: `Screenshot_20250831-152856`, `-153316`; skip them) + 8 hardware photos in `Hardware/`.
   - **`Hardware/01_Team_Photo.jpg` is the cover image (Rockson: "very important")**: use it as the card/hero/OG image wherever CurrentWatch appears. The other hardware photos (box interior, test rig) lead the "what it does" rows.
   - Rockson's own phone number and email in the screenshots: keep as-is (approved).
3. **HTU Cafeteria** (`htu-cafeteria`)

   - Campus food-ordering mobile app + admin dashboard.
   - Stack: React Native, Expo, TypeScript, Supabase, Zustand.
   - Side project; all data in the screenshots is dummy. Rockson is looking for a cafeteria to adopt it, so frame it as ready to use.
   - Assets: admin dashboard (11), mobile app (11).
4. **The Ghana Experience** (`ghana-experience`)

   - Client work for 1957 The Ghana Experience LBG. Tourism website with visitor side and admin workspace. Live: https://ghanaexperience.xyz
   - All screenshots approved to show as-is (including the reviews screen).
   - Stack: Django, React, Cloudinary. Repo: https://github.com/rocksonowusu/tourism (TODO: confirm same project)
   - Assets: landing (6), admin (4).
5. **Respira AI** (`respira-ai`)

   - Pneumonia-detection tool using image classification on chest X-rays; Django web app serving a trained model (Hugging Face). Shows Grad-CAM heatmaps. Rockson also designed the logo.
   - Chest X-rays in the screenshots are from a public Kaggle dataset; patient names are dummy data.
   - TODO: model accuracy/metrics (landing page claims 98.2% sensitivity, unconfirmed: don't use until confirmed), repo link.
   - Assets: landing, dashboard, results, Grad-CAM (10).
6. **EstimatePro** (`estimatepro`)

   - TODO: one-line description. Django backend: https://github.com/rocksonowusu/EstimatePro_Backend
   - Assets: 23 phone screenshots. Shows Big Tony Enterprise's real business details and letterhead: approved to show everything (it doubles as marketing for them).
7. **Carfinder** (`carfinder`)

   - TODO: description, stack, role.
   - Assets: 15 images (Carfinder7 is missing from sequence. Ignore the gap). Low resolution (410–620px wide): show small/framed, never full-bleed. All content approved to show.

**Lab / in progress (smaller cards, no full case study yet):**

- **Amplify**: web app (PWA) to manage small electrical companies: apprentices, tasks, contracts, tools, announcements, customer communication. Django + DRF. Piloting at Big Tonny Enterprise. Status: In progress. No images yet: design a typographic card.
- **Ecommerce Django App**: full-stack online store. https://github.com/rocksonowusu/Ecommerce-Django-App
- **Design**: logos (incl. Respira AI), SVG assets, developer wallpapers. Link to Behance.

**Hero copy (draft. Rockson may edit):**

> Rockson Kwesi Owusu
> I build web apps, mobile apps and ESP32 devices, and I teach programming at Ho Technical University in Ghana.

**Content rules (non-negotiable):**

- Never show real student or lecturer names, emails or index numbers. The names/emails in the delivered screenshots were reviewed with Rockson on 2026-10-24 and are approved (Timetabling identities are test data; other projects approved per entry above). For any NEW screenshot, flag what looks like real personal data and ask before using it.
- CV source: `Owusu_Rockson_CV.pdf.docx` in the project root. The site's downloadable CV must not publish referees' phone numbers/emails or Rockson's street address ("References available on request").
- Credit co-developers and HTU wherever a project appears (card, case study, share image).
- Prefer real figures over adjectives. Don't write "revolutionary", "seamless", "cutting-edge".

---

## 7. Case study template (`/work/[slug]`)

1. Cover image (shared-element transition target) + title (Archivo, wide) + status + live/repo links
2. Facts strip: role, stack, year (TODO per project), team credits
3. The problem (2–3 sentences)
4. What it does: alternating image/text rows, images bleed off-grid; phone screenshots shown in a minimal CSS phone frame, desktop screenshots in a minimal white browser frame
5. Figures (only if real numbers exist)
6. Gallery: masonry of remaining images, click opens a fullscreen lightbox (keyboard + swipe)
7. Next project: large image; scrolling to the end auto-transitions (with a cancel window) or click

---

## 8. Assets & image pipeline

Rockson will place files here:

```
/raw/projects/<project folder as delivered>/...   (screenshots, .mp4)
/raw/me/portrait.(jpg|png)                        (his photo)
```

`/raw` is git-ignored. Write `scripts/process-images.mjs` (sharp) that:

- Maps delivered folder names → slugs (`HTU Timetabling Suite` → `htu-timetabling-suite`, `HTU Caf (Images)` → `htu-cafeteria`, `CurrentWatch Project` → `currentwatch`, `Estimate Pro` → `estimatepro`, `GhanaExperience` → `ghana-experience`, `Respira AI` → `respira-ai`, `Carfinder` → `carfinder`).
- Outputs to `/public/images/<slug>/` as AVIF + WebP at 640 / 1280 / 2048 widths, kebab-case filenames, natural sort order.
- Writes `src/content/images.generated.json`: dimensions, aspect, `blurDataURL`, and `device: 'phone'|'desktop'` (aspect < 0.7 → phone).
- Compresses the Timetabling `.mp4` with ffmpeg to H.264 1080p (and WebM), plus a poster frame. Videos: `muted playsInline loop`, lazy-loaded, never autoplay above the fold on mobile data.

### Portrait edit

From `/raw/me/portrait.*` produce:

1. **Cut-out**: background removed (use `rembg` in Python, or `@imgly/background-removal-node`), clean edges, transparent PNG + WebP.
2. **Black & white grade**: true greyscale, lifted whites, deep but not crushed blacks, light film grain. Must sit naturally on `--paper` and `--chalk`.
3. **Full-frame B&W** version for /about.
4. Square 1:1 crop for OG/share images.
   Show me before/after before continuing.

---

## 9. Quality bar

- Lighthouse (mobile): Performance ≥ 90, Accessibility ≥ 95, SEO 100. LCP < 2.5s, CLS < 0.05.
- Hero image `priority`; everything else lazy with blur placeholders and correct `sizes`.
- GSAP/Lenis loaded only on the client; ScrollTriggers cleaned up on route change (no leaks, no stale pins).
- Keyboard: visible focus rings (ink), skip link, lightbox trap, Esc closes overlays.
- Contrast: graphite text passes AA on every white.
- Responsive: 360px → 2560px. Pinned/horizontal effects degrade to vertical layouts on mobile.
- SEO: metadata per page, `next/og` share image per project (cover + title + credits), `sitemap.ts`, `robots.ts`, JSON-LD `Person`.

---

## 10. Phases (stop after each)

| Phase | Deliverable                                                                                      | Done when                                        |
| ----- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| 0     | Inventory `/raw`, list missing TODOs as questions                                              | I've answered or said "use placeholders"         |
| 1     | Next.js scaffold, tokens, Archivo, Lenis + GSAP setup, layout shell, nav, cursor, reduced-motion | Blank pages with paper sheets stacking correctly |
| 2     | Image pipeline + portrait edit                                                                   | Generated JSON + before/after portrait approved  |
| 3     | Home: preloader, hero, featured pinned sequence, work gallery, teaching, lab, contact sheet      | Smooth on desktop + mobile                       |
| 4     | `/work` index + `/work/[slug]` template + View Transitions                                   | All 7 projects render from data                  |
| 5     | `/about` + timeline + CV + 404                                                                 | Content approved                                 |
| 6     | Performance, accessibility, SEO, OG images                                                       | Quality bar met (show Lighthouse)                |
| 7     | Git init/push, Vercel deploy, custom domain (TODO: domain name)                                  | Live URL works                                   |

**Before writing code in each phase:** state what you'll build in ≤5 bullets. **After:** screenshots + what's left.
