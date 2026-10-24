import { Develop } from "@/components/media/Develop";
import { DeviceFrame } from "@/components/media/DeviceFrame";
import { Picture } from "@/components/media/Picture";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { projectImage } from "@/content/images";
import { creditLine, type Project } from "@/content/projects";

/**
 * Gallery card. The cover sits in a linen mount whatever its shape: photos fill it,
 * screenshots sit in their device frame. Credits always travel with the project.
 */
export function ProjectCard({ project, sizes }: { project: Project; sizes: string }) {
  const image = projectImage(project.images, project.cover.image);
  const credits = creditLine(project);

  return (
    <TransitionLink href={`/work/${project.slug}`} morph label={project.title} data-cursor="View" className="group block">
      <Develop mono cover className="aspect-[4/5] bg-linen" style={{ "--focus": project.cover.focus ?? "50% 50%" } as React.CSSProperties}>
        {image.device === "photo" ? (
          <Picture
            image={image}
            alt={project.cover.alt}
            sizes={sizes}
            className="block size-full"
            imgClassName="size-full object-cover [object-position:var(--focus)] transition-transform duration-[1.2s] ease-[var(--ease-paper)] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex size-full items-center justify-center p-[8%]">
            <DeviceFrame
              device={image.device}
              className={`transition-transform duration-[1.2s] ease-[var(--ease-paper)] group-hover:scale-[1.03] ${
                image.device === "phone" ? "h-full w-auto [&_img]:h-full [&_img]:w-auto" : "w-full"
              }`}
            >
              <Picture image={image} alt={project.cover.alt} sizes={sizes} />
            </DeviceFrame>
          </div>
        )}
      </Develop>
      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className="stretch-on-hover wdth text-h3 font-semibold">{project.title}</h3>
        {project.status === "Live" && <span className="shrink-0 text-small text-graphite">Live</span>}
      </div>
      <p className="mt-1 text-small text-graphite">{project.kind.join(", ")}</p>
      {credits && <p className="mt-2 max-w-[44ch] text-small text-graphite">{credits}</p>}
    </TransitionLink>
  );
}
