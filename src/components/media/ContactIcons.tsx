import { siBehance, siGithub, siWhatsapp } from "simple-icons";
import { TechIcon } from "@/components/media/TechIcon";

// Contact marks, all decorative (the label is always beside them). Brands are their own filled
// marks in ink; plain actions (email, call) are drawn as simple line icons.

type IconProps = { className?: string };

export const MailIcon = ({ className = "" }: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden focusable="false" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" className={`shrink-0 ${className}`}>
    <rect x="2.5" y="4.5" width="19" height="15" rx="1.5" />
    <path d="m3 6 9 7 9-7" />
  </svg>
);

export const PhoneIcon = ({ className = "" }: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden focusable="false" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" className={`shrink-0 ${className}`}>
    <path d="M5.5 3h3l1.6 4.4-2 1.4a12 12 0 0 0 7.1 7.1l1.4-2L21 15.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 3.5 5.2 2 2 0 0 1 5.5 3Z" />
  </svg>
);

export const WhatsAppIcon = ({ className = "" }: IconProps) => <TechIcon icon={siWhatsapp} className={className} />;
export const GitHubIcon = ({ className = "" }: IconProps) => <TechIcon icon={siGithub} className={className} />;
export const BehanceIcon = ({ className = "" }: IconProps) => <TechIcon icon={siBehance} className={className} />;

/** LinkedIn's mark (no longer in Simple Icons). */
export const LinkedInIcon = ({ className = "" }: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden focusable="false" fill="currentColor" className={`shrink-0 ${className}`}>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
  </svg>
);
