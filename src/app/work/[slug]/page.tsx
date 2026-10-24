import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Develop } from "@/components/media/Develop";
import { DeviceFrame } from "@/components/media/DeviceFrame";
import { describe, Framed } from "@/components/media/Framed";
import { Picture } from "@/components/media/Picture";
import { TechLabel } from "@/components/media/TechIcon";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { Sheet } from "@/components/sheets/Sheet";
import { Gallery } from "@/components/work/Gallery";
import { NextProject } from "@/components/work/NextProject";
import { ScrollProgress } from "@/components/work/ScrollProgress";
import { StoryRows } from "@/components/work/StoryRows";
import { projectImage, projectImages, type ImageEntry } from "@/content/images";
import { creditLine, getProject, nextProject, projects, type Project } from "@/content/projects";
import { ogBase, ogImage, site } from "@/content/site";
import { techIcon } from "@/content/tech";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  const url = `/work/${project.slug}`;
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: url },
    openGraph: {
      ...ogBase,
      type: "article",
      title: `${project.title} | ${site.name}`,
      description: project.summary,
      url,
      images: [ogImage.project(project.slug, project.title)],
    },
    twitter: { card: "summary_large_image", images: [ogImage.project(project.slug, project.title)] },
  };
}

const wide = (n: number) => ({ "--wdth": n }) as React.CSSProperties;

/** The cover: photos fill the frame, screenshots sit in their device frame on a linen mount. */
function Cover({
  image,
  alt,
  focus,
  priority,
}: {
  image: ImageEntry;
  alt: string;
  focus?: string;
  priority?: boolean;
}) {
  if (image.device === "photo") {
    return (
      <div className="size-full [&_img]:size-full [&_img]:object-cover" style={{ "--focus": focus ?? "50% 50%" } as React.CSSProperties}>
        <Picture image={image} alt={alt} sizes="100vw" priority={priority} className="block size-full" imgClassName="[object-position:var(--focus)]" />
      </div>
    );
  }
  return (
    <div className="flex size-full items-center justify-center bg-linen p-[6%]">
      <DeviceFrame
        device={image.device}
        className={image.device === "phone" ? "h-full [&_img]:h-full [&_img]:w-auto" : "w-full max-w-[1400px]"}
      >
        <Picture image={image} alt={alt} sizes={image.device === "phone" ? "40vw" : "90vw"} priority={priority} />
      </DeviceFrame>
    </div>
  );
}

function Links({ project }: { project: Project }) {
  const links = [
    project.links?.live && { label: `Visit ${new URL(project.links.live).host}`, href: project.links.live },
    project.links?.repo && { label: "Source on GitHub", href: project.links.repo },
    ...(project.links?.repos ?? []).map((r) => ({ label: `${r.label} source on GitHub`, href: r.href })),
  ].filter(Boolean) as { label: string; href: string }[];
  if (!links.length) return null;
  return (
    <ul className="flex flex-wrap gap-x-8 gap-y-2">
      {links.map((l) => (
        <li key={l.href}>
          <a href={l.href} target="_blank" rel="noreferrer" className="link-underline font-semibold">
            {l.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export default async function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  const cover = projectImage(project.images, project.cover.image);
  const used = new Set([project.cover.image, ...project.story.flatMap((r) => r.images)]);
  const rest = projectImages(project.images).filter((e) => !used.has(e.name));
  const next = nextProject(project.slug);
  const nextCover = projectImage(next.images, next.cover.image);

  // structured data: the project, its makers and where it lives
  const projectLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    url: `${site.url}/work/${project.slug}`,
    dateCreated: project.year,
    creator: (project.credits ?? [{ name: site.name, role: project.role }])
      .filter((c) => c.role !== "Client")
      .map((c) => ({ "@type": "Person", name: c.name })),
    ...(project.credits?.some((c) => c.role === "Client") && {
      funder: { "@type": "Organization", name: project.credits.find((c) => c.role === "Client")!.name },
    }),
    ...(project.links?.live && { sameAs: project.links.live }),
    keywords: [...project.kind, ...project.stack].join(", "),
    ...(creditLine(project) && { creditText: creditLine(project) }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(projectLd) }} />
      <ScrollProgress />

      {/* 1. cover, title, status, links */}
      <Sheet tone="paper" aria-labelledby="project-title" data-rail-label="Overview" className="flex flex-col pt-32">
        <div className="px-gutter">
          <p className="text-small text-graphite">
            {project.status}
            {project.year && `, ${project.year}`}
          </p>
          <h1 id="project-title" className="wdth mt-3 text-display font-semibold tracking-tight" style={wide(118)}>
            {project.title}
          </h1>
          <div className="mt-8 grid gap-6 md:grid-cols-12">
            <p className="max-w-[52ch] text-h3 text-graphite md:col-span-7">{project.summary}</p>
            <div className="text-small md:col-span-4 md:col-start-9 md:self-end">
              <Links project={project} />
            </div>
          </div>
        </div>
        {/* shared-element target for the morph from a project card (M10) */}
        {/* where a clicked project image lands (M10) */}
        <div data-cover-target className="mt-14 h-[min(78svh,62vw)] min-h-[320px]">
          <Cover image={cover} alt={project.cover.alt} focus={project.cover.focus} priority />
        </div>
      </Sheet>

      {/* 2. facts, 3. the problem */}
      <Sheet tone="chalk" aria-label="About the project" data-rail-label="The problem" className="flex flex-col justify-center gap-24 px-gutter py-28">
        <dl className="grid gap-x-6 gap-y-10 border-t border-ink pt-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-small text-graphite">Role</dt>
            <dd className="mt-2">{project.role}</dd>
          </div>
          {project.stack.length > 0 && (
            <div>
              <dt className="text-small text-graphite">Stack</dt>
              <dd className="mt-2">
                <ul className="flex flex-wrap gap-x-5 gap-y-2">
                  {project.stack.map((t) => (
                    <li key={t}>
                      <TechLabel icon={techIcon(t)} label={t} iconClassName="size-[1.05em]" />
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
          {project.year && (
            <div>
              <dt className="text-small text-graphite">Year</dt>
              <dd className="mt-2">{project.year}</dd>
            </div>
          )}
          {project.credits && (
            <div className="lg:col-span-2">
              <dt className="text-small text-graphite">Team</dt>
              <dd className="mt-2">
                <ul className="space-y-1">
                  {project.credits.map((c) => (
                    <li key={c.name}>
                      {c.name} <span className="text-graphite">({c.role.toLowerCase()})</span>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
        <div className="grid gap-6 md:grid-cols-12">
          <h2 className="text-small text-graphite md:col-span-3">The problem</h2>
          <p className="text-h2 leading-[1.25] md:col-span-9">{project.problem}</p>
        </div>
      </Sheet>

      {/* 4. what it does */}
      <Sheet tone="bone" aria-labelledby="does-title" className="px-gutter py-28">
        <h2 id="does-title" className="wdth mb-20 text-h1 font-semibold" style={wide(115)}>
          What it does
        </h2>
        <StoryRows project={project} />
      </Sheet>

      {/* 5. figures, only when real numbers exist */}
      {project.figures && (
        <Sheet tone="linen" aria-labelledby="figures-title" className="flex flex-col justify-center px-gutter py-28">
          <h2 id="figures-title" className="text-small text-graphite">
            In numbers
          </h2>
          <dl className="mt-10 grid gap-12 md:grid-cols-3">
            {project.figures.map((f) => (
              <div key={f.label} className="flex flex-col-reverse border-t border-ink pt-6">
                <dt className="mt-3 max-w-[22ch] text-graphite">{f.label}</dt>
                <dd className="wdth text-[clamp(3.5rem,9vw,8.5rem)] leading-none font-semibold" style={wide(112)}>
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
        </Sheet>
      )}

      {/* 6. gallery */}
      {rest.length > 0 && (
        <Sheet tone="chalk" aria-labelledby="gallery-title" className="px-gutter py-28">
          <h2 id="gallery-title" className="wdth mb-14 text-h1 font-semibold" style={wide(115)}>
            More screens
          </h2>
          <Gallery
            title={project.title}
            items={rest.map((img) => {
              const alt = describe(project.title, img.name);
              return {
                image: img,
                alt,
                thumb: <Framed image={img} alt={alt} sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 45vw" />,
              };
            })}
          />
        </Sheet>
      )}

      {/* 7. next project */}
      <Sheet tone="paper" aria-labelledby="next-title" data-rail-label="Next project">
        <NextProject title={next.title}>
          <TransitionLink
            href={`/work/${next.slug}`}
            morph
            label={next.title}
            data-next
            data-cursor="View"
            className="group block"
          >
            <p className="text-small text-graphite">Next project</p>
            <h2 id="next-title" className="stretch-on-hover wdth mt-2 text-h1 font-semibold">
              {next.title}
            </h2>
            <Develop mono cover className="mt-8 h-[48svh] -mx-[var(--gutter)]">
              <Cover image={nextCover} alt={next.cover.alt} focus={next.cover.focus} />
            </Develop>
          </TransitionLink>
        </NextProject>
      </Sheet>
    </>
  );
}
