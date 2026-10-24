import type { Metadata } from "next";
import { Timeline, type TimelineEntry } from "@/components/about/Timeline";
import { Develop } from "@/components/media/Develop";
import { Picture } from "@/components/media/Picture";
import { Magnetic } from "@/components/motion/Magnetic";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { Sheet } from "@/components/sheets/Sheet";
import { meImage } from "@/content/images";
import { ogBase, ogImage, site } from "@/content/site";

const description =
  "Rockson Kwesi Owusu: developer in Ho, Ghana, building web, mobile and ESP32 systems, and Assistant Lecturer in Computer Science at Ho Technical University.";

export const metadata: Metadata = {
  title: "About",
  description,
  alternates: { canonical: "/about" },
  openGraph: { ...ogBase, type: "profile", title: `About | ${site.name}`, description, url: "/about", images: [ogImage.default] },
};

const CV = { href: "/cv/Rockson-Kwesi-Owusu-CV.pdf", size: "130 KB" };

// Facts from Rockson's CV (Sept 2026) and CLAUDE.md. DRAFT copy: waiting for Rockson's approval.
const timeline: TimelineEntry[] = [
  {
    when: "2021–2025",
    role: "BTech in ICT (Honours), with Distinction",
    org: "Ho Technical University",
    points: [
      "Software and web development, information security, networking, system administration and ICT management.",
    ],
  },
  {
    when: "2021–2024",
    role: "Apprentice electrician (part-time)",
    org: "Big Tony Enterprise, Ho",
    points: ["Electrical wiring and basic panel work.", "Helped prepare the company profile."],
  },
  {
    when: "2022",
    role: "Intern",
    org: "Electricity Company of Ghana, Ho",
    points: [
      "October to December 2022.",
      "Resolved users' IT issues and troubleshot the network; hardware maintenance and software updates.",
    ],
  },
  {
    when: "2023",
    role: "Intern",
    org: "Ghana Water Limited, Ho",
    points: [
      "October to November 2023.",
      "Configured routers and supported IT infrastructure; applied GIS techniques and gave user IT support.",
    ],
  },
  {
    when: "2024",
    role: "Intern",
    org: "University of Health and Allied Sciences, Ho",
    points: [
      "September to October 2024.",
      "Built an asset management system for the university, and Unifile, an app that merges CSV files.",
    ],
  },
  {
    when: "2025–2026",
    role: "Assistant Lecturer",
    org: "Computer Science Department, Ho Technical University",
    points: [
      "November 2025 to October 2026 (national service).",
      "Taught programming, Computer Organisation and Architecture, and Computer Literacy across six non-CS programmes.",
    ],
  },
];

const courses = [
  "Programming with C++",
  "Python",
  "Android development in Java",
  "Computer Organisation and Architecture",
  "Computer Literacy",
];
const programmes = [
  "Tourism",
  "Hospitality",
  "Marketing",
  "Biomedical Engineering",
  "Mechanical Engineering",
  "Building Technology",
];

const wide = (n: number) => ({ "--wdth": n }) as React.CSSProperties;

function CvLink({ className = "" }: { className?: string }) {
  return (
    <Magnetic className={className}>
      <a href={CV.href} download className="group inline-flex items-baseline gap-3 border-b border-ink pb-1 font-semibold">
        <span className="stretch-on-hover wdth">Download CV</span>
        <span className="text-small font-normal text-graphite">PDF, {CV.size}</span>
      </a>
    </Magnetic>
  );
}

export default function AboutPage() {
  const portrait = meImage("portrait-bw");

  return (
    <>
      {/* ---------- Story ---------- */}
      <Sheet tone="paper" aria-labelledby="about-title" data-rail-label="Story" className="px-gutter pt-36 pb-24">
        <h1 id="about-title" className="wdth text-display font-semibold tracking-tight" style={wide(120)}>
          About
        </h1>
        <div className="mt-14 grid gap-12 md:grid-cols-12 md:gap-x-6">
          <Develop immediate delay={0.2} className="md:col-span-5 md:-ml-[var(--gutter)]">
            <Picture
              image={portrait}
              alt="Rockson Kwesi Owusu at a desk with a laptop, in black and white"
              sizes="(min-width: 768px) 42vw, 100vw"
              priority
            />
          </Develop>
          <div className="space-y-6 md:col-span-6 md:col-start-7 md:pt-4">
            <p className="text-h2 leading-[1.25]">
              I&apos;m Rockson Kwesi Owusu, a developer in Ho, in Ghana&apos;s Volta Region. I build web apps, mobile
              apps and ESP32 devices, and I teach programming at Ho Technical University, where I earned my BTech in ICT with distinction.
            </p>
            <p className="max-w-[60ch] text-graphite">
              The work I care about runs in the real world. The HTU Timetabling Suite builds the university&apos;s
              semester timetable. CurrentWatch measures current on real circuits and switches a socket off when it
              overloads. The Ghana Experience takes a tour company&apos;s trip and event requests.
            </p>
            <p className="max-w-[60ch] text-graphite">
              Before the software, I learned wiring and panel work as an apprentice at Big Tony Enterprise, then
              interned at ECG, Ghana Water and UHAS.
            </p>
            <div className="flex flex-wrap items-center gap-x-10 gap-y-6 pt-6">
              <CvLink />
              <ul className="flex gap-6 text-small">
                {[
                  ["GitHub", site.links.github],
                  ["LinkedIn", site.links.linkedin],
                  ["Behance", site.links.behance],
                ].map(([label, href]) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noreferrer" className="link-underline">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Sheet>

      {/* ---------- Teaching ---------- */}
      <Sheet tone="linen" aria-labelledby="teaching-title" className="flex flex-col justify-center px-gutter py-28">
        <div className="grid gap-12 md:grid-cols-12 md:gap-x-6">
          <div className="md:col-span-5">
            <h2 id="teaching-title" className="wdth text-h1 font-semibold" style={wide(115)}>
              Teaching
            </h2>
            <p className="mt-6 max-w-[44ch] text-graphite">
              Assistant Lecturer, Computer Science Department, Ho Technical University. November 2025 to October
              2026, as national service.
            </p>
          </div>
          <div className="space-y-14 md:col-span-7">
            <div>
              <h3 className="text-small text-graphite">BTech ICT, Level 100</h3>
              <ul className="mt-3 border-t border-ink">
                {courses.map((c) => (
                  <li key={c} className="group border-b border-haze py-3">
                    <span className="stretch-on-hover wdth text-h3 font-semibold">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-small text-graphite">Computer Literacy (Word, Excel, PowerPoint) for</h3>
              <p className="mt-3 text-h3">{programmes.join(", ")}.</p>
            </div>
            <div className="grid gap-8 sm:grid-cols-3">
              <div>
                <h3 className="font-semibold">Materials</h3>
                <p className="mt-2 text-small text-graphite">
                  Lab tutorials, workbooks, slide decks and practical exam papers built around Ghanaian business
                  case studies.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Assessment</h3>
                <p className="mt-2 text-small text-graphite">
                  Mid-semester exams, quizzes and practical exams, set and marked; grade records and eligibility
                  lists.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Final-year projects</h3>
                <p className="mt-2 text-small text-graphite">
                  Supported theses and projects, including Django web systems, Arduino IoT systems and AI chest
                  X-ray screening.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Sheet>

      {/* ---------- Timeline ---------- */}
      <Sheet tone="bone" aria-labelledby="timeline-title" data-rail-label="Timeline" className="px-gutter py-28">
        <h2 id="timeline-title" className="wdth mb-16 text-h1 font-semibold" style={wide(115)}>
          So far
        </h2>
        <Timeline entries={timeline} />
      </Sheet>

      {/* ---------- CV ---------- */}
      <Sheet tone="chalk" aria-labelledby="cv-title" className="flex flex-col justify-center px-gutter py-28">
        <div className="grid gap-12 border-t border-ink pt-8 md:grid-cols-12 md:gap-x-6">
          <h2 id="cv-title" className="wdth text-h1 font-semibold md:col-span-5" style={wide(115)}>
            The CV
          </h2>
          <div className="md:col-span-6 md:col-start-7">
            <p className="max-w-[44ch] text-h3 text-graphite">
              Experience, projects and skills on three pages. References are available on request.
            </p>
            <CvLink className="mt-10" />
            <p className="mt-10 text-small text-graphite">
              Or see the{" "}
              <TransitionLink href="/work" label="Work" className="link-underline text-ink">
                work
              </TransitionLink>
              .
            </p>
          </div>
        </div>
      </Sheet>
    </>
  );
}
