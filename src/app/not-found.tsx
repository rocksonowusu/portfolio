import { TransitionLink } from "@/components/motion/TransitionLink";
import { Sheet } from "@/components/sheets/Sheet";
import { projects } from "@/content/projects";

export default function NotFound() {
  return (
    <Sheet tone="paper" aria-labelledby="nf-title" className="flex flex-col justify-end px-gutter pt-40 pb-20">
      <p className="text-small text-graphite">404</p>
      <h1 id="nf-title" className="wdth mt-4 text-display font-semibold tracking-tight" style={{ "--wdth": 120 } as React.CSSProperties}>
        This sheet is missing
      </h1>
      <p className="mt-8 max-w-[44ch] text-h3 text-graphite">
        The page you asked for isn&apos;t in the stack. It may have moved, or the link has a typo.
      </p>
      <div className="mt-16 grid gap-10 border-t border-ink pt-8 md:grid-cols-12">
        <ul className="space-y-2 md:col-span-4">
          {[
            ["/", "Back to the first page"],
            ["/work", "All work"],
            ["/about", "About Rockson"],
          ].map(([href, label]) => (
            <li key={href}>
              <TransitionLink href={href} className="group inline-block text-h3 font-semibold">
                <span className="stretch-on-hover wdth">{label}</span>
              </TransitionLink>
            </li>
          ))}
        </ul>
        <div className="md:col-span-7 md:col-start-6">
          <p className="text-small text-graphite">Or one of the projects</p>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {projects.map((p) => (
              <li key={p.slug}>
                <TransitionLink href={`/work/${p.slug}`} className="link-underline">
                  {p.title}
                </TransitionLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Sheet>
  );
}
