"use client";

import { TransitionLink as Link } from "@/components/motion/TransitionLink";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { nav, site } from "@/content/site";

type MenuProps = {
  pathname: string;
  onClose: () => void;
  onContact: (e: React.MouseEvent) => void;
};

/** Full-screen paper menu for small screens. Loaded on first open (see Nav). */
export function MobileMenu({ open, ...props }: MenuProps & { open: boolean }) {
  return <AnimatePresence>{open && <Panel {...props} />}</AnimatePresence>;
}

function Panel({ pathname, onClose, onContact }: MenuProps) {
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = panelRef.current!;
    panel.querySelector<HTMLElement>("a")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab") return;
      // keep focus inside the menu and its toggle button
      const toggle = document.querySelector<HTMLElement>('[aria-controls="mobile-menu"]');
      const items = [...panel.querySelectorAll<HTMLElement>("a"), toggle].filter(Boolean) as HTMLElement[];
      const i = items.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        items.at(-1)?.focus();
      } else if (!e.shiftKey && i === items.length - 1) {
        e.preventDefault();
        items[0].focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const sheet = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { clipPath: "inset(0 0 100% 0)" },
        animate: { clipPath: "inset(0 0 0% 0)" },
        exit: { clipPath: "inset(100% 0 0% 0)" },
      };

  const links = [...nav, { href: "#contact", label: "Contact" }];

  return (
    <motion.div
      ref={panelRef}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="fixed inset-0 z-40 flex flex-col justify-end bg-paper px-gutter pb-12"
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      {...sheet}
    >
      <ul className="flex flex-col gap-2">
        {links.map((item, i) => (
          <motion.li
            key={item.href}
            initial={reduceMotion ? false : { y: "60%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {item.href === "#contact" ? (
              <a
                href="#contact"
                onClick={onContact}
                className="block text-h1 font-semibold"
                style={{ fontStretch: "118%" }}
              >
                {item.label}
              </a>
            ) : (
              <Link
                href={item.href}
                aria-current={pathname.startsWith(item.href) ? "page" : undefined}
                className="block text-h1 font-semibold"
                style={{ fontStretch: "118%" }}
              >
                {item.label}
              </Link>
            )}
          </motion.li>
        ))}
      </ul>
      <p className="mt-10 text-small text-graphite">{site.location}</p>
    </motion.div>
  );
}
