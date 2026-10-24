import type { Metadata } from "next";
import { ProjectCard } from "@/components/home/ProjectCard";
import { Sheet } from "@/components/sheets/Sheet";
import { WorkIndex } from "@/components/work/WorkIndex";
import { imageUrl, projectImages } from "@/content/images";
import { creditLine, projects } from "@/content/projects";
import { ogBase, ogImage, site } from "@/content/site";

const description =
  "Web, mobile, IoT and AI projects by Rockson Kwesi Owusu, from live university systems to ESP32 hardware.";

export const metadata: Metadata = {
  title: "Work",
  description,
  alternates: { canonical: "/work" },
  openGraph: { ...ogBase, title: `Work | ${site.name}`, description, url: "/work", images: [ogImage.default] },
};

export default function WorkPage() {
  return (
    <Sheet tone="paper" aria-labelledby="work-title" className="px-gutter pt-36 pb-32">
      <h1 id="work-title" className="wdth text-display font-semibold tracking-tight" style={{ "--wdth": 120 } as React.CSSProperties}>
        Work
      </h1>
      <p className="mt-6 mb-16 max-w-[52ch] text-h3 text-graphite">
        Systems in use at a university, a client&apos;s live site, ESP32 hardware and the apps around them.
      </p>
      <WorkIndex
        items={projects.map((p) => ({
          slug: p.slug,
          title: p.title,
          kind: p.kind,
          status: p.status,
          year: p.year,
          credits: creditLine(p),
          trail: [p.cover.image, ...p.story.flatMap((r) => r.images)]
            .slice(0, 6)
            .map((name) => imageUrl(projectImages(p.images).find((e) => e.name === name)!, 400, "webp")),
          card: <ProjectCard project={p} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" />,
        }))}
      />
    </Sheet>
  );
}
