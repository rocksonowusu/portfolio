import { Framed } from "@/components/media/Framed";
import { DeviceFrame } from "@/components/media/DeviceFrame";
import { Develop } from "@/components/media/Develop";
import { LazyVideo } from "@/components/media/LazyVideo";
import { Picture } from "@/components/media/Picture";
import { projectImage, projectVideos } from "@/content/images";
import type { Project } from "@/content/projects";

/**
 * §7.4 "What it does": alternating text and image rows. Media bleeds off the grid on its side;
 * phones line up in a row of frames, desktop screens overlap like loose prints, photos sit bare.
 */
export function StoryRows({ project }: { project: Project }) {
  return (
    <ol className="space-y-32 md:space-y-48">
      {project.story.map((row, i) => {
        const flip = i % 2 === 1;
        const images = row.images.map((n) => projectImage(project.images, n));
        const device = images[0].device;
        const video = row.video ? projectVideos(project.images).find((v) => v.name === row.video) : undefined;

        let media: React.ReactNode;
        if (device === "phone") {
          media = (
            <div className="flex items-start gap-[clamp(0.75rem,2vw,2rem)]">
              {images.map((img, k) => (
                <Framed
                  key={img.name}
                  image={img}
                  alt={k === 0 ? row.alt : ""}
                  sizes="(min-width: 768px) 18vw, 30vw"
                  className={`w-[min(30%,260px)] ${k % 2 === 1 ? "md:mt-16" : ""}`}
                />
              ))}
            </div>
          );
        } else if (device === "photo") {
          media = (
            <div className="grid grid-cols-2 items-start gap-[clamp(0.75rem,2vw,2rem)]">
              {images.map((img, k) => (
                <Framed
                  key={img.name}
                  image={img}
                  alt={k === 0 ? row.alt : ""}
                  sizes="(min-width: 768px) 30vw, 50vw"
                  className={k % 2 === 1 ? "mt-[18%]" : ""}
                />
              ))}
            </div>
          );
        } else {
          // desktop screens: the first sits large, the rest overlap below it, offset to the inside
          media = (
            <div className="relative">
              {video ? (
                <Develop mono>
                  <DeviceFrame device="desktop">
                    <LazyVideo
                      video={video}
                      label={`Walkthrough: ${row.body}`}
                      poster={<Picture image={video.poster} alt={row.alt} sizes="(min-width: 768px) 62vw, 100vw" />}
                    />
                  </DeviceFrame>
                </Develop>
              ) : (
                <Framed image={images[0]} alt={row.alt} sizes="(min-width: 768px) 62vw, 100vw" />
              )}
              {images.slice(video ? 0 : 1, video ? 1 : 2).map((img) => (
                <Framed
                  key={img.name}
                  image={img}
                  alt=""
                  sizes="(min-width: 768px) 40vw, 70vw"
                  className={`relative -mt-[12%] w-[64%] shadow-[0_24px_48px_-24px_rgb(0_0_0/0.35)] ${flip ? "ml-auto" : ""}`}
                />
              ))}
            </div>
          );
        }

        return (
          <li key={row.title} className="grid items-start gap-10 md:grid-cols-12 md:gap-x-6">
            <div className={`md:sticky md:top-28 md:col-span-4 ${flip ? "md:order-2 md:col-start-9" : ""}`}>
              <h3 className="wdth text-h2 font-semibold" style={{ "--wdth": 108 } as React.CSSProperties}>
                {row.title}
              </h3>
              <p className="mt-4 max-w-[44ch] text-graphite">{row.body}</p>
              {row.caption && <p className="mt-4 max-w-[44ch] text-small text-graphite">{row.caption}</p>}
            </div>
            <div
              className={`md:col-span-8 ${
                flip ? "md:order-1 md:-ml-[var(--gutter)]" : "md:col-start-5 md:-mr-[var(--gutter)]"
              } ${device === "phone" ? "md:px-[4%]" : ""}`}
            >
              {media}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
