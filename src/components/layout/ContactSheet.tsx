import {
  BehanceIcon,
  GitHubIcon,
  LinkedInIcon,
  MailIcon,
  PhoneIcon,
  WhatsAppIcon,
} from "@/components/media/ContactIcons";
import { Magnetic } from "@/components/motion/Magnetic";
import { site } from "@/content/site";

const direct = [
  { label: "Email", value: site.email, href: `mailto:${site.email}`, Icon: MailIcon },
  { label: "Call", value: site.phone.display, href: site.phone.href, Icon: PhoneIcon },
  { label: "WhatsApp", value: site.phone.display, href: site.whatsapp, Icon: WhatsAppIcon, external: true },
];

const elsewhere = [
  { label: "GitHub", href: site.links.github, Icon: GitHubIcon },
  { label: "LinkedIn", href: site.links.linkedin, Icon: LinkedInIcon },
  { label: "Behance", href: site.links.behance, Icon: BehanceIcon },
];

/** The ink sheet: contact, laid over the last sheet of every page. */
export function ContactSheet() {
  return (
    <footer
      id="contact"
      data-sheet-marker
      className="contact-sheet flex flex-col justify-between bg-ink px-gutter pt-28 pb-8 text-paper"
    >
      <div>
        <h2 className="max-w-[14ch] text-h1 font-semibold" style={{ fontStretch: "118%" }}>
          Have something that needs to work in the real world?
        </h2>
        <Magnetic strength={0.15} className="mt-10 md:mt-14">
          <a
            href={`mailto:${site.email}`}
            className="link-underline block text-[clamp(1.75rem,6.4vw,6.5rem)] leading-none font-semibold break-all sm:break-normal"
            style={{ fontStretch: "105%" }}
          >
            {site.email}
          </a>
        </Magnetic>

        {/* every way to reach Rockson, each with its mark */}
        <ul className="mt-12 grid max-w-5xl gap-x-10 gap-y-6 border-t border-paper/25 pt-8 sm:grid-cols-3 md:mt-16">
          {direct.map(({ label, value, href, Icon, external }) => (
            <li key={label}>
              <a
                href={href}
                {...(external && { target: "_blank", rel: "noreferrer" })}
                className="group flex items-start gap-4"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-paper/35 transition-colors duration-300 group-hover:bg-paper group-hover:text-ink group-focus-visible:bg-paper group-focus-visible:text-ink">
                  <Icon className="size-5" />
                </span>
                <span className="flex flex-col">
                  <span className="text-small text-haze">{label}</span>
                  <span className="link-underline self-start text-h3 font-semibold">{value}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-16 flex flex-col gap-8 text-small md:flex-row md:items-end md:justify-between">
        <ul className="flex flex-wrap gap-x-8 gap-y-3 text-body">
          {elsewhere.map(({ label, href, Icon }) => (
            <li key={label}>
              <Magnetic>
                <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
                  <Icon className="size-[1.05em]" />
                  <span className="link-underline">{label}</span>
                </a>
              </Magnetic>
            </li>
          ))}
        </ul>
        <p className="text-haze">
          {site.name}, {site.location}
        </p>
      </div>
    </footer>
  );
}
