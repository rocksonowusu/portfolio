import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ContactSheet } from "@/components/layout/ContactSheet";
import { Nav } from "@/components/layout/Nav";
import { Preloader } from "@/components/home/Preloader";
import { Cursor } from "@/components/motion/Cursor";
import { PageTransition } from "@/components/motion/PageTransition";
import { ScrollRail } from "@/components/motion/ScrollRail";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { ogBase, ogImage, site } from "@/content/site";
import { headScript } from "@/lib/intro";
import "./globals.css";

// Variable Archivo with the width axis: the width axis is the type treatment (§3).
// Self-hosted (latin subset, from Google Fonts) so dev and builds never depend on reaching
// fonts.gstatic.com: a timeout there used to break `npm run dev` after clearing .next.
const archivo = localFont({
  src: "./fonts/Archivo-Variable.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-archivo",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.intro,
  alternates: { canonical: "/" },
  openGraph: { ...ogBase, title: site.name, description: site.intro, url: "/", images: [ogImage.default] },
  twitter: { card: "summary_large_image", images: [ogImage.default] },
  authors: [{ name: site.name, url: site.url }],
};

// Structured data: who this site is about (§9 JSON-LD Person)
const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  alternateName: "Owusu Rockson Kwesi",
  url: site.url,
  email: `mailto:${site.email}`,
  telephone: "+233557533568",
  jobTitle: "Developer and Assistant Lecturer",
  worksFor: { "@type": "CollegeOrUniversity", name: "Ho Technical University", url: "https://www.htu.edu.gh" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "Ho Technical University" },
  address: { "@type": "PostalAddress", addressLocality: "Ho", addressRegion: "Volta Region", addressCountry: "GH" },
  knowsAbout: ["Web development", "Mobile apps", "IoT", "ESP32", "MicroPython", "Django", "React", "Machine learning"],
  sameAs: [site.links.github, site.links.linkedin, site.links.behance],
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // the head script adds classes to <html> before hydration
    <html lang="en" className={archivo.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: headScript }} />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Preloader />
        <SmoothScroll>
          <Nav />
          <main id="main" tabIndex={-1} className="sheet-stack outline-none">
            {children}
          </main>
          <ContactSheet />
          <ScrollRail />
          <Cursor />
          <PageTransition />
        </SmoothScroll>
      </body>
    </html>
  );
}
