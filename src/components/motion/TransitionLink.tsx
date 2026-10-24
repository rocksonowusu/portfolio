"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { startPageTransition } from "@/lib/page-transition";

type TransitionLinkProps = React.ComponentProps<typeof NextLink> & {
  href: string;
  /** Carry the `[data-cover] img` inside this link across to the next page's cover. */
  morph?: boolean;
  /** Name shown on the loading sheet; defaults to the link's text. */
  label?: string;
};

/** Internal link with the page transition (M10). Modifier-key clicks open normally. */
export function TransitionLink({ href, morph, label, onClick, children, ...rest }: TransitionLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (href === window.location.pathname) return;

    e.preventDefault();
    const img = morph ? e.currentTarget.querySelector<HTMLImageElement>("[data-cover] img") : null;
    // fetch while the sheet slides up; swap routes once it covers, so the change is never seen
    router.prefetch(href);
    startPageTransition({
      href,
      label: label ?? e.currentTarget.textContent?.trim().slice(0, 60) ?? "",
      source: img?.currentSrc ? { src: img.currentSrc, rect: img.getBoundingClientRect() } : undefined,
    }).then(() => router.push(href));
  };

  return (
    <NextLink href={href} onClick={handleClick} {...rest}>
      {children}
    </NextLink>
  );
}
