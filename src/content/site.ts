export const site = {
  name: "Rockson Kwesi Owusu",
  shortName: "Rockson Owusu",
  location: "Ho, Volta Region, Ghana",
  // NEXT_PUBLIC_SITE_URL once the custom domain is live (Phase 7); Vercel's production URL until then
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
  email: "orockson02@gmail.com",
  phone: { href: "tel:+233557533568", display: "+233 55 753 3568" },
  whatsapp: "https://wa.me/233557533568?text=" + encodeURIComponent("Hi Rockson, I saw your portfolio."),
  intro:
    "I build web apps, mobile apps and ESP32 devices, and I teach programming at Ho Technical University in Ghana.",
  links: {
    github: "https://github.com/rocksonowusu",
    linkedin: "https://www.linkedin.com/in/owusu-rockson-a57629340/",
    behance: "https://www.behance.net/Rockson_Owusu",
  },
} as const;

/** Open Graph fields every page shares; pages add their own title, description and url. */
export const ogBase = { siteName: site.name, locale: "en_GH", type: "website" } as const;

const ogSize = { width: 1200, height: 630 };
/** Rendered by scripts/build-og.mjs. */
export const ogImage = {
  default: { url: "/og/default.jpg", ...ogSize, alt: `${site.name}, in black and white, beside his name` },
  project: (slug: string, title: string) => ({ url: `/og/${slug}.jpg`, ...ogSize, alt: `${title}: cover, title and credits` }),
};

export const nav = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
] as const;
