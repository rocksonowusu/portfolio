"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Magnetic } from "@/components/motion/Magnetic";
import { TransitionLink as Link } from "@/components/motion/TransitionLink";
import { scrollToTarget, useLenis } from "@/components/motion/SmoothScroll";
import { nav, site } from "@/content/site";

// Motion only loads once someone opens the menu: it stays out of the first-load bundle.
const MobileMenu = dynamic(() => import("./MobileMenu").then((m) => m.MobileMenu), { ssr: false });

export function Nav() {
  const [open, setOpen] = useState(false);
  const [menuLoaded, setMenuLoaded] = useState(false);
  const pathname = usePathname();
  const lenis = useLenis();
  const toggleRef = useRef<HTMLButtonElement>(null);

  const goToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    scrollToTarget(lenis, "#contact");
  };

  // Close on route change.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Freeze the page behind the menu.
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const { overflow } = document.documentElement.style;
    document.documentElement.style.overflow = "hidden";
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = overflow;
    };
  }, [open, lenis]);

  return (
    <>
      {/* difference blending keeps the nav legible on every white and on the ink sheet */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 text-paper mix-blend-difference">
        <nav
          aria-label="Main"
          className="flex items-baseline justify-between px-gutter py-5 text-small md:text-body"
        >
          <Magnetic className="pointer-events-auto">
            <Link href="/" className="font-semibold" style={{ fontStretch: "112%" }}>
              {site.name}
            </Link>
          </Magnetic>

          <ul className="pointer-events-auto hidden gap-8 md:flex">
            {nav.map((item) => (
              <li key={item.href}>
                <Magnetic>
                  <Link
                    href={item.href}
                    aria-current={pathname.startsWith(item.href) ? "page" : undefined}
                    className="link-underline"
                  >
                    {item.label}
                  </Link>
                </Magnetic>
              </li>
            ))}
            <li>
              <Magnetic>
                <a href="#contact" onClick={goToContact} className="link-underline">
                  Contact
                </a>
              </Magnetic>
            </li>
          </ul>

          <button
            ref={toggleRef}
            type="button"
            className="pointer-events-auto md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => {
              setMenuLoaded(true);
              setOpen((o) => !o);
            }}
          >
            {open ? "Close" : "Menu"}
          </button>
        </nav>
      </header>

      {menuLoaded && (
        <MobileMenu
          open={open}
          pathname={pathname}
          onClose={() => {
            setOpen(false);
            toggleRef.current?.focus();
          }}
          onContact={goToContact}
        />
      )}
    </>
  );
}
