// Facts come from CLAUDE.md §6. Copy marked DRAFT was written from what the delivered screenshots
// show and is waiting for Rockson's approval. Anything marked TODO is waiting on Rockson: never
// fill it in by guessing.

export type Kind = "Web" | "Mobile" | "IoT" | "AI";
export type Status = "Live" | "Completed" | "In progress";

export type StoryRow = {
  title: string;
  body: string;
  /** Image names from images.generated.json; the first is used where only one fits. */
  images: string[];
  /** Plays in place of the first image where motion is allowed. */
  video?: string;
  alt: string;
  caption?: string;
};

export type Project = {
  slug: string;
  title: string;
  kind: Kind[];
  summary: string;
  /** Case study: the problem, in two or three sentences. */
  problem: string;
  role: string;
  stack: string[];
  status: Status;
  year?: string;
  links?: { live?: string; repo?: string; repos?: { label: string; href: string }[] };
  credits?: { name: string; role: string }[];
  figures?: { value: string; label: string }[];
  /** Folder under /public/images and key into images.generated.json */
  images: string;
  /** Image used on cards, the gallery and the case-study cover. `focus` is a CSS object-position. */
  cover: { image: string; alt: string; focus?: string };
  /** Case-study rows: what it does, one claim per row. The featured section uses the first four. */
  story: StoryRow[];
  featured?: boolean;
};

/** "With Kassim Abdulai Junior and Carlos Ankora, for Ho Technical University" */
export function creditLine(project: Project) {
  const others = (project.credits ?? []).filter(
    (c) => c.name !== "Rockson Kwesi Owusu" && c.role !== "Client",
  );
  const client = project.credits?.find((c) => c.role === "Client");
  const names = others.map((c) => c.name);
  const people =
    names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names[0];
  const line = [people && `With ${people}`, client && `for ${client.name}`].filter(Boolean).join(", ");
  return line ? line[0].toUpperCase() + line.slice(1) : undefined;
}

export const projects: Project[] = [
  {
    slug: "htu-timetabling-suite",
    title: "HTU Timetabling Suite",
    kind: ["Web"],
    summary:
      "The timetable system Ho Technical University runs on. It generates a whole semester, shows lecturers the slots that fit when they ask for a change, and puts each student's timetable on their phone.",
    // DRAFT
    problem:
      "Ho Technical University's timetable was put together by hand, and it took weeks every semester. Twenty departments share lecturers and rooms, so every late change risked a clash somewhere else.",
    role: "Developer",
    stack: ["React (Vite)", "FastAPI", "MySQL", "cPanel"],
    status: "Live",
    year: "2026",
    links: { live: "https://tts.htu.edu.gh" },
    credits: [
      { name: "Rockson Kwesi Owusu", role: "Developer" },
      { name: "Kassim Abdulai Junior", role: "Co-developer" },
      { name: "Carlos Ankora", role: "Project supervisor" },
      { name: "Ho Technical University", role: "Client" },
    ],
    figures: [
      { value: "1,000+", label: "sessions placed in one generated semester" },
      { value: "0", label: "clashes" },
      { value: "Weeks", label: "the manual process used to take" },
    ],
    images: "htu-timetabling-suite",
    cover: {
      image: "landing-page1",
      alt: "Landing page of the HTU Timetabling Suite over an aerial photo of the Ho Technical University campus",
    },
    story: [
      {
        title: "A whole semester, generated",
        body: "Every department's classes, lecturers and rooms go in; a conflict-free timetable for the semester comes out, department by department.",
        images: ["timetable-walkthrough-step-5-generation-progress", "timetable-walkthrough-step-5"],
        alt: "Generation progress: departments being scheduled one after another, with sessions placed and still unplaced",
      },
      {
        title: "Clashes resolved before anyone sees them",
        body: "The resolver lists what still needs a decision, offers the slots that fit, and checks every swap for clashes.",
        video: "timetable-resolver3-walkthrough",
        images: ["timetable-resolver1", "timetable-resolver2"],
        alt: "The timetable resolver listing classes that need a slot, each with a find-a-slot action",
      },
      {
        title: "Lecturers ask, the system shows what fits",
        body: "Lecturers request a change and see only the slots that work. Each request is reviewed and approved in one place.",
        images: ["admin-page7-academic-request-page", "admin-page6-approvals-page"],
        alt: "Academic requests page showing approved timetable moves with the reason for each",
      },
      {
        title: "Every student's timetable, on their phone",
        body: "Students sign in with their HTU Google account and get their own timetable, a reminder 30 minutes before class and a daily schedule email.",
        images: ["auth-page2-student-sign-up"],
        alt: "Student sign-up page: your schedule, in your pocket",
      },
      {
        // DRAFT
        title: "One workspace for the whole university",
        body: "Departments, programmes, courses, lecturer assignments and venues are managed in one place, and every change is kept in an audit trail.",
        images: ["admin-page1-dashboard", "admin-page4-assignments"],
        alt: "Admin dashboard with counts of departments, programmes, venues, courses and lecturers",
      },
    ],
    featured: true,
  },
  {
    slug: "currentwatch",
    title: "CurrentWatch",
    kind: ["IoT", "Mobile"],
    summary:
      "An end-to-end system that monitors electrical current: ESP32 firmware in MicroPython feeding a live dashboard and a mobile app. Final-year project.",
    // DRAFT
    problem:
      "In most homes, an electrical fault only shows itself when a breaker trips or something burns. CurrentWatch measures the current on each circuit, shows it live on a phone, locks a socket that overloads and sends an SMS alert.",
    role: "Lead developer: built the whole working system",
    stack: ["ESP32", "MicroPython"],
    status: "Completed",
    year: "2025",
    links: {
      repos: [
        { label: "Hardware", href: "https://github.com/rocksonowusu/CurrentWatchHardware" },
        { label: "Frontend", href: "https://github.com/rocksonowusu/CurrentWatchFrontend" },
      ],
    },
    credits: [
      { name: "Rockson Kwesi Owusu", role: "Lead developer" },
      { name: "Atisu Zanetor Susan", role: "Project lead, documentation" },
      { name: "Godson Favour", role: "Design" },
    ],
    images: "currentwatch",
    cover: {
      image: "01-team-photo",
      alt: "The CurrentWatch team on campus holding the finished monitoring rig",
      focus: "50% 46%",
    },
    // DRAFT
    story: [
      {
        title: "The hardware, on one board",
        body: "An ESP32 drives relay modules and current sensors inside one enclosure. The test rig carries sockets, bulbs and a fan so every circuit can be loaded and measured.",
        images: ["02-inside-the-box", "06-test-rig-open-a"],
        alt: "Inside the CurrentWatch enclosure: ESP32 board, relay modules and wiring",
      },
      {
        title: "Set up in six steps",
        body: "Onboarding takes a new user from their name and phone number to rooms and paired devices, scanning the QR code on each device.",
        images: ["screenshot-20250825-185947", "screenshot-20250825-191332", "screenshot-20250825-191705"],
        alt: "Onboarding screens: alert setup, adding a device by QR code, setup complete",
      },
      {
        title: "Live current, room by room",
        body: "The dashboard shows the total load against the circuit's limit, which devices are on in each room and the current through every socket.",
        images: ["screenshot-20250825-191838", "screenshot-20250825-191757"],
        alt: "Dashboard showing 3.1 amps of total load, and a living-room socket drawing 0.51 amps",
      },
      {
        title: "Overloads lock themselves",
        body: "When a socket draws too much, CurrentWatch switches it off, locks it for 120 seconds and logs it. An emergency control turns everything off at once.",
        images: ["screenshot-20250831-153433", "screenshot-20250831-153535"],
        alt: "Settings screen with an overload lock warning, and the activity log of locks and switches",
      },
    ],
  },
  {
    slug: "htu-cafeteria",
    title: "HTU Cafeteria",
    kind: ["Mobile", "Web"],
    summary:
      "A campus food-ordering app with an admin dashboard: students order ahead and pay, the kitchen works from a live queue. Built as a side project and ready for a cafeteria to adopt.",
    // DRAFT
    problem:
      "Students queue at the counter to order and pay, often between classes. The app lets them order ahead and pick up when the food is ready, while the kitchen and the counter work from one dashboard.",
    role: "Developer",
    stack: ["React Native", "Expo", "TypeScript", "Supabase", "Zustand"],
    status: "Completed",
    year: "2026",
    images: "htu-cafeteria",
    cover: {
      image: "landing-page1",
      alt: "HTU Cafeteria landing page: campus meals, done right",
    },
    // DRAFT
    story: [
      {
        title: "Order ahead from a phone",
        body: "Students browse the day's menu, choose a pickup time and pay with mobile money or when they collect.",
        images: ["homepage", "menu", "checkout-screen"],
        alt: "Mobile app home, menu and checkout screens",
      },
      {
        title: "Told when it is ready",
        body: "Each order is tracked from placed to ready for pickup, with a notification at every step.",
        images: ["order-placed", "notifations"],
        alt: "Order placed confirmation with status steps, and the notifications list",
      },
      {
        title: "One dashboard for kitchen and counter",
        body: "Staff see live orders and the queue, take walk-in sales at a point of sale and keep track of payments.",
        images: ["dashboard", "point-of-sale"],
        alt: "Admin dashboard with recent orders and live queue, and the point-of-sale screen",
      },
      {
        title: "The menu, kept current",
        body: "Dishes are added and priced, marked sold out or set as today's special, straight from the dashboard.",
        images: ["edit-menu-or-add-menu", "menu-page"],
        alt: "Editing a menu item, and the menu management list",
      },
    ],
  },
  {
    slug: "ghana-experience",
    title: "The Ghana Experience",
    kind: ["Web"],
    summary:
      "Client work for 1957 The Ghana Experience LBG: a tourism website with a visitor side for tours, events and reviews, and an admin workspace to run it.",
    // DRAFT
    problem:
      "A tour company needed one place to show its tours, events and community work, take trip and event requests and collect reviews, and a workspace its own team could run without a developer.",
    role: "Developer",
    stack: ["Django", "React", "Cloudinary"],
    status: "Live",
    year: "2025",
    links: { live: "https://ghanaexperience.xyz", repo: "https://github.com/rocksonowusu/tourism" },
    credits: [{ name: "1957 The Ghana Experience LBG", role: "Client" }],
    images: "ghana-experience",
    cover: {
      image: "landingpage2",
      alt: "The Ghana Experience home page with a group of travellers on a forest trail",
    },
    // DRAFT
    story: [
      {
        title: "Tours and events up front",
        body: "The visitor side leads with tour packages and upcoming events, each opening into its details and a request to book.",
        images: ["landingpage4", "landingpage1"],
        alt: "Tour packages list, and a tour package opened over the home page",
      },
      {
        title: "Reviews and community work",
        body: "Guest reviews and the company's community projects live on the site, approved and published from the admin side.",
        images: ["landingpage5", "landingpage6"],
        alt: "Guest review cards, and the community impact section",
      },
      {
        title: "A workspace the team runs themselves",
        body: "Staff manage events, tours, trip and service requests, reviews and media, and edit company details and social links without touching code.",
        images: ["admin1", "admin2", "admin4"],
        alt: "Admin dashboard, reviews moderation and company settings",
      },
    ],
  },
  {
    slug: "respira-ai",
    title: "Respira AI",
    kind: ["AI", "Web"],
    summary:
      "Pneumonia screening on chest X-rays: a Django web app serving a trained image classifier, with Grad-CAM heatmaps showing where the model looked. Rockson also designed the logo.",
    // DRAFT
    problem:
      "Reading chest X-rays for pneumonia takes a trained eye and time. Respira AI gives clinicians a second read: a prediction with its confidence and a heatmap of what drove it, with a clinician signing off every result.",
    role: "Developer and logo designer",
    stack: ["Django", "Hugging Face"],
    status: "Completed",
    year: "2026",
    // TODO: repo link, confirmed model metrics
    images: "respira-ai",
    cover: {
      image: "landing-page",
      alt: "Respira AI landing page: read chest X-rays with confidence",
    },
    // DRAFT
    story: [
      {
        title: "Upload, screen, review",
        body: "A clinician attaches an X-ray to a patient, runs the screen and the result joins a review queue.",
        images: ["chest-x-ray-analysis", "dashboard"],
        alt: "Chest X-ray analysis screen with upload steps, and the dashboard of recent analyses",
      },
      {
        title: "A result with its reasons",
        body: "Each result shows the prediction and its confidence, with a Grad-CAM heatmap of the regions that most influenced it.",
        images: ["result-not-normal", "ai-focus-gradcam"],
        alt: "A pneumonia result at 99% confidence, and the Grad-CAM heatmap over the X-ray",
      },
      {
        title: "Patients, and a clinician's sign-off",
        body: "Patients are registered once and every study stays linked to them. Nothing is final until a clinician reviews and signs it off.",
        images: ["patients-list", "register-patients"],
        alt: "Patients and studies list, and the register patient form",
        caption: "X-rays in the screenshots are from a public Kaggle dataset; patient names are test data.",
      },
    ],
  },
  {
    slug: "estimatepro",
    title: "EstimatePro",
    kind: ["Mobile"],
    // DRAFT: from the screenshots
    summary:
      "A mobile app for contractors to build itemised estimates and send them as PDFs on their own letterhead.",
    // DRAFT
    problem:
      "Small contractors write estimates by hand or in a spreadsheet, then retype them onto letterhead. EstimatePro builds the estimate on the phone and exports it as a branded PDF, ready to share.",
    role: "Developer",
    stack: ["React Native", "Django (backend)"],
    status: "Completed",
    year: "2024",
    links: { repo: "https://github.com/rocksonowusu/EstimatePro_Backend" },
    images: "estimatepro",
    cover: {
      image: "screenshot-20250420-182047",
      alt: "EstimatePro estimate preview with line items and total",
    },
    // DRAFT
    story: [
      {
        title: "Set up the business once",
        body: "Onboarding collects the company's details and its letterhead, so every estimate carries the brand.",
        images: ["screenshot-20250420-181132", "screenshot-20250420-181206", "screenshot-20250420-181325"],
        alt: "Onboarding: personalise your brand, upload your letterhead, business details",
      },
      {
        title: "Build the estimate",
        body: "Line items with quantities and unit prices, a workmanship fee and notes, with totals that add up as you type.",
        images: ["screenshot-20250420-181959", "screenshot-20250420-182004"],
        alt: "Create estimate form with items, quantities, unit prices and workmanship",
      },
      {
        title: "Send it on the letterhead",
        body: "The finished estimate exports as a PDF on the company's letterhead and goes out through any app on the phone.",
        images: ["screenshot-20250420-182047", "screenshot-20250420-182208"],
        alt: "Estimate preview, and the exported PDF on Big Tony Enterprise letterhead",
        caption: "Shown with Big Tony Enterprise's real details.",
      },
    ],
  },
  {
    slug: "carfinder",
    title: "Carfinder",
    kind: ["Web"],
    // DRAFT: from the screenshots
    summary:
      "A car-buying web app: search and filter listings, compare cars side by side, save favourites and get recommendations.",
    // DRAFT
    problem:
      "Buying a car means comparing listings spread over many sites. Carfinder brings search, filters, side-by-side comparison, favourites and recommendations into one place, and lets users add cars to the catalogue.",
    role: "Developer", // TODO: confirm role
    stack: ["Django"],
    status: "Completed",
    year: "2025",
    images: "carfinder",
    cover: {
      image: "carfinder1",
      alt: "Carfinder home page: find your perfect car match",
    },
    // DRAFT
    story: [
      {
        title: "Search and filter",
        body: "Search by make, model or description, then narrow listings by brand, category and price.",
        images: ["carfinder1", "carfinder4"],
        alt: "Home page search form, and the car listing with filters",
      },
      {
        title: "Compare and decide",
        body: "Put cars side by side spec by spec, and see similar cars to any listing.",
        images: ["carfinder12", "carfinder13"],
        alt: "Specifications comparison table, and cars similar to an Acura TLX",
      },
      {
        title: "Built around the buyer",
        body: "Saved favourites, recommendations based on what you search for, and a dashboard of comparisons.",
        images: ["carfinder9", "carfinder10", "carfinder11"],
        alt: "User dashboard, recommended cars and favourite cars",
      },
      {
        title: "Contribute a listing",
        body: "Signed-in users add cars to the catalogue in five steps, photos included.",
        images: ["carfinder14", "carfinder16"],
        alt: "Contribute to our car catalogue form, and the add images step",
      },
    ],
  },
];

export type LabItem = {
  title: string;
  summary: string;
  status?: Status;
  href?: string;
};

export const lab: LabItem[] = [
  {
    title: "Amplify",
    summary:
      "A web app (PWA) for running small electrical companies: apprentices, tasks, contracts, tools, announcements and customer communication. Piloting at Big Tony Enterprise.",
    status: "In progress",
  },
  {
    title: "Ecommerce Django App",
    summary: "A full-stack online store.",
    href: "https://github.com/rocksonowusu/Ecommerce-Django-App",
  },
  {
    title: "Design",
    summary: "Logos (including Respira AI), SVG assets and developer wallpapers.",
    href: "https://www.behance.net/Rockson_Owusu",
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

/** The project after `slug`, wrapping around: drives "Next project" at the end of a case study. */
export function nextProject(slug: string) {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
}
