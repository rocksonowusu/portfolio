#!/usr/bin/env node
// Builds Rockson's CV from one content source, in two versions:
//
//   Owusu_Rockson_CV_2026.docx / .pdf        full copy for Rockson to send (git-ignored)
//   public/cv/Rockson-Kwesi-Owusu-CV.pdf     web copy: no referees' contact details, no street address
//
// Source: Owusu_Rockson_CV.pdf.docx (Sept 2026), updated with the projects in CLAUDE.md.
// PDF conversion drives Microsoft Word through PowerShell, so it needs Windows with Word installed.
//
//   node scripts/build-cv.mjs

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  LevelFormat,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

const ROOT = process.cwd();
const FONT = "Times New Roman";
const GREY = "9A9A9A";

// ---------- content ----------

const contact = {
  full: "Ho Magreen Street V/R Ghana",
  web: "Ho, Volta Region, Ghana",
  phone: "+233 557 533 568",
  email: "orockson02@gmail.com",
  links: [
    { label: "github.com/rocksonowusu", href: "https://github.com/rocksonowusu" },
    { label: "linkedin.com/in/owusu-rockson-a57629340", href: "https://www.linkedin.com/in/owusu-rockson-a57629340/" },
    { label: "behance.net/Rockson_Owusu", href: "https://www.behance.net/Rockson_Owusu" },
  ],
};

const profile =
  "BTech ICT graduate (Honours, with Distinction) and Assistant Lecturer in the Computer Science Department at Ho Technical University, " +
  "teaching programming (C++, Python, Java/Android), Computer Organisation and Architecture, and Computer Literacy. " +
  "Builds web and mobile apps and IoT systems, including the HTU Timetabling Suite, which generates Ho Technical " +
  "University's semester timetable. Works in Python (Django, FastAPI), React and React Native, and ESP32 with " +
  "MicroPython. Hands-on experience from internships at ECG, Ghana Water Limited and UHAS, plus practical electrical " +
  "experience from a 3-year apprenticeship at Big Tony Enterprise.";

const education = [
  {
    org: "Ho Technical University",
    place: "Ho, Ghana",
    title: "Bachelor of Technology in ICT (Honours), with Distinction",
    when: "2021 – 2025",
    points: [
      "Focus on software and web development, computer information security, networking, system administration (Linux and Windows), and ICT management.",
    ],
  },
];

const experience = [
  {
    org: "Ho Technical University, Computer Science Department",
    place: "Ho, Ghana",
    title: "Assistant Lecturer",
    when: "November 2025 – October 2026",
    points: [
      "Taught BTech ICT Level 100 courses: Programming with C++, Python, Android Development (Java), and Computer Organisation and Architecture.",
      "Delivered Computer Literacy (Word, Excel, PowerPoint) to students in Tourism, Hospitality, Marketing, Biomedical Engineering, Mechanical Engineering and Building Technology.",
      "Developed lab tutorials, workbooks, slide decks and practical exam papers built around Ghanaian business case studies.",
      "Set and marked mid-semester exams, quizzes and practical exams; compiled grade records and exam eligibility lists.",
      "Supported final-year students with theses and projects, including Django web systems, Arduino-based IoT systems and AI chest X-ray screening.",
    ],
  },
  {
    org: "University of Health & Allied Sciences (UHAS)",
    place: "Ho, Ghana",
    title: "Intern",
    when: "September – October 2024",
    points: [
      "Developed an asset management system for the university.",
      "Created “Unifile,” an app that merges and combines CSV files.",
    ],
  },
  {
    org: "Ghana Water Limited (GWL)",
    place: "Ho, Ghana",
    title: "Intern",
    when: "October – November 2023",
    points: ["Configured routers and supported IT infrastructure.", "Applied GIS techniques and provided user IT support."],
  },
  {
    org: "Electricity Company of Ghana (ECG)",
    place: "Ho, Ghana",
    title: "Intern",
    when: "October – December 2022",
    points: [
      "Resolved IT issues for users and performed network troubleshooting.",
      "Managed hardware maintenance and software updates.",
    ],
  },
  {
    org: "Big Tony Enterprise (Electrical Company)",
    place: "Ho, Ghana",
    title: "Apprentice (Part-time)",
    when: "2021 – 2024",
    points: ["Hands-on experience in electrical wiring and basic panel work.", "Helped prepare the company profile."],
  },
];

const projects = [
  {
    name: "HTU Timetabling Suite",
    note: "2026, live at tts.htu.edu.gh",
    text:
      "University timetable system in use at Ho Technical University. Generates a whole semester (over 1,000 sessions) with zero clashes; lecturers request changes and see the slots that fit; drag-to-swap with clash checks, free-room finder, Google sign-in with HTU accounts, student timetables on the phone, class reminders and daily schedule emails. React (Vite), FastAPI, MySQL. Built with Kassim Abdulai Junior; supervised by Carlos Ankora.",
  },
  {
    name: "CurrentWatch",
    note: "2025",
    text:
      "End-to-end IoT system that monitors electrical current: ESP32 firmware in MicroPython feeding a live dashboard and a mobile app, with per-socket readings, overload lock-out and SMS alerts. Final-year project; lead developer, with Atisu Zanetor Susan and Godson Favour.",
  },
  {
    name: "The Ghana Experience",
    note: "2025, client work, live at ghanaexperience.xyz",
    text: "Tourism website with a visitor side for tours, events and reviews and an admin workspace to run it. Django, React, Cloudinary.",
  },
  {
    name: "HTU Cafeteria",
    note: "2026",
    text: "Campus food-ordering mobile app with an admin dashboard and point of sale. React Native, Expo, TypeScript, Supabase, Zustand.",
  },
  {
    name: "Respira AI",
    note: "2026",
    text: "Pneumonia screening on chest X-rays: a Django web app serving a trained image classifier, with Grad-CAM heatmaps and clinician sign-off. Also designed the logo.",
  },
  {
    name: "EstimatePro",
    note: "2024",
    text: "React Native app for contractors to build itemised estimates and export them as PDFs on their own letterhead, with a Django backend.",
  },
  {
    name: "Amplify",
    note: "in development",
    text: "Web app (PWA) for managing small electrical companies: apprentices, tasks, contracts, tools and customer communication. Built with Django REST Framework; pilot at Big Tony Enterprise.",
  },
];

const skills = [
  ["Programming Languages", "Python, Java, C++, TypeScript, JavaScript, MicroPython, HTML, SQL (MySQL, SQLite)"],
  ["Frameworks", "Django, Django REST Framework, FastAPI, React, React Native (Expo), Android"],
  ["Data and Hosting", "MySQL, Supabase, Cloudinary, cPanel"],
  ["IoT", "ESP32, MicroPython, relay and current-sensor circuits"],
  ["Machine Learning", "Image classification, Grad-CAM explainability, Hugging Face models"],
  ["System Administration", "Network setup, hardware maintenance, IT support"],
  ["Office Productivity", "Microsoft Word, Excel, PowerPoint"],
  ["Teaching", "Course material development, assessment design, student project support"],
  ["Graphic Design", "Logos, SVG assets and developer wallpapers"],
  ["Electrical Work", "Electrical wiring, panel work"],
];

const references = [
  ["Mr. Agyemang Doho Steven", "Regional ICT Manager", "Ghana Electricity Company", "sdagyeman@ecggh.com", "+233 242 281 351"],
  ["Mr. Dabillah Solomon", "Regional Innovation and Technology Manager", "Ghana Water Limited", "solomon@gwcl.com.gh", "+233 546 272 518"],
  ["Mr. Anthony Yao Owusu", "CEO / Electrical Contractor", "Big Tony Enterprise", "yaoowusu123@gmail.com", "+233 208 442 359"],
];

// ---------- layout helpers ----------

const run = (text, opts = {}) => new TextRun({ text, font: FONT, size: 23, ...opts });
const para = (children, opts = {}) =>
  new Paragraph({ children: Array.isArray(children) ? children : [children], spacing: { after: 60 }, ...opts });
const link = (label, href) =>
  new ExternalHyperlink({ link: href, children: [run(label, { underline: {}, color: "000000" })] });

/** Section heading with a grey rule above, like the original. */
const section = (title) =>
  new Paragraph({
    children: [run(title, { bold: true, size: 24 })],
    spacing: { before: 280, after: 120 },
    border: { top: { style: BorderStyle.SINGLE, size: 8, color: GREY, space: 12 } },
  });

const bullet = (text) => new Paragraph({ children: [run(text)], numbering: { reference: "bullets", level: 0 }, spacing: { after: 70 } });

const entry = (e) => [
  para([run(e.org, { bold: true }), run(` — ${e.place}`)], { spacing: { after: 0 }, keepNext: true }),
  para([run(e.title, { bold: true }), run(` — ${e.when}`)], { spacing: { after: 80 }, keepNext: true }),
  ...e.points.map(bullet),
];

function build(version) {
  const web = version === "web";
  const children = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [run("Owusu Rockson Kwesi", { bold: true, size: 32 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 20 },
      children: [run(web ? contact.web : contact.full)],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 20 },
      children: [run(`${contact.phone} | `), link(contact.email, `mailto:${contact.email}`)],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: contact.links.flatMap((l, i) => [...(i ? [run(" | ")] : []), link(l.label, l.href)]),
    }),

    section("Profile"),
    para(run(profile), { alignment: AlignmentType.JUSTIFIED }),

    section("Education"),
    ...education.flatMap(entry),

    section("Experience"),
    ...experience.flatMap(entry),

    section("Projects"),
    ...projects.map(
      (p) =>
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { after: 90 },
          children: [run(p.name, { bold: true }), ...(p.note ? [run(` (${p.note})`)] : []), run(`: ${p.text}`)],
        }),
    ),

    section("Skills"),
    ...skills.map(
      ([k, v]) =>
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { after: 60 },
          children: [run(`${k}: `, { bold: true }), run(v)],
        }),
    ),

    section("References"),
    ...(web
      ? [para(run("Available on request."))]
      : references.flatMap(([name, ...lines]) => [
          para(run(name, { bold: true }), { spacing: { after: 0 }, keepNext: true }),
          ...lines.map((l, i) => para(run(l), { spacing: { after: i === lines.length - 1 ? 160 : 0 }, keepNext: i < lines.length - 1 })),
        ])),
  ];

  return new Document({
    creator: "Rockson Kwesi Owusu",
    title: "Owusu Rockson Kwesi — CV",
    styles: { default: { document: { run: { font: FONT, size: 23 } } } },
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        // A4 with 1-inch margins, like the original
        properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
        children,
      },
    ],
  });
}

/** Word (via COM) renders the PDF, so it matches what Rockson sees when he opens the .docx. */
function toPdf(docx, pdf) {
  const ps = `
$w = New-Object -ComObject Word.Application
$w.Visible = $false
try {
  $d = $w.Documents.Open('${docx.replaceAll("'", "''")}', $false, $true)
  $d.ExportAsFixedFormat('${pdf.replaceAll("'", "''")}', 17)
  $d.Close($false)
} finally { $w.Quit() }`;
  execFileSync("powershell", ["-NoProfile", "-NonInteractive", "-Command", ps], { stdio: "inherit" });
}

const out = [
  { version: "full", docx: path.join(ROOT, "Owusu_Rockson_CV_2026.docx"), pdf: path.join(ROOT, "Owusu_Rockson_CV_2026.pdf") },
  {
    version: "web",
    docx: path.join(ROOT, "raw/.cache/cv/Rockson-Kwesi-Owusu-CV.docx"),
    pdf: path.join(ROOT, "public/cv/Rockson-Kwesi-Owusu-CV.pdf"),
  },
];

for (const o of out) {
  mkdirSync(path.dirname(o.docx), { recursive: true });
  mkdirSync(path.dirname(o.pdf), { recursive: true });
  writeFileSync(o.docx, await Packer.toBuffer(build(o.version)));
  toPdf(o.docx, o.pdf);
  console.log(`${o.version}: ${path.relative(ROOT, o.docx)} → ${path.relative(ROOT, o.pdf)}`);
}
