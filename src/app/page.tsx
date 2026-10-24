import { FeaturedSequence } from "@/components/home/FeaturedSequence";
import { HeroName } from "@/components/home/HeroName";
import { Marquee } from "@/components/home/Marquee";
import { ProjectCard } from "@/components/home/ProjectCard";
import { WorkGallery } from "@/components/home/WorkGallery";
import { Develop } from "@/components/media/Develop";
import { DeviceFrame } from "@/components/media/DeviceFrame";
import { LazyVideo } from "@/components/media/LazyVideo";
import { Picture } from "@/components/media/Picture";
import { TransitionLink as Link } from "@/components/motion/TransitionLink";
import { Sheet } from "@/components/sheets/Sheet";
import { meImage, projectImage, projectVideos } from "@/content/images";
import { creditLine, lab, projects } from "@/content/projects";
import { site } from "@/content/site";

const courses = ["C++", "Python", "Android development in Java", "Computer Literacy"];
const programmes = [
  "Tourism",
  "Biomedical Engineering",
  "Mechanical Engineering",
  "Hospitality",
  "Marketing",
  "Building Technology",
];
const stack = [
  "Python",
  "Django",
  "React",
  "React Native",
  "TypeScript",
  "FastAPI",
  "MySQL",
  "Supabase",
  "ESP32",
  "MicroPython",
  "Java",
  "C++",
];

export default function Home() {
  const featured = projects.find((p) => p.featured)!;
  const rest = projects.filter((p) => !p.featured);
  const portrait = meImage("portrait-cutout");

  return (
    <>
      {/* ---------- Hero ---------- */}
      <Sheet tone="paper" aria-labelledby="hero-title" data-rail-label="Intro" className="flex flex-col overflow-hidden px-gutter pt-28">
        <HeroName id="hero-title">{site.name}</HeroName>
        <div className="mt-auto grid grid-cols-12 items-end gap-x-6 pt-10">
          <p className="col-span-12 pb-10 text-h3 text-graphite md:col-span-5 md:pb-16">
            <span className="block max-w-[34ch]">{site.intro}</span>
          </p>
          <Develop immediate delay={0.5} className="col-span-12 justify-self-center md:col-span-6 md:col-start-7 md:justify-self-end">
            <Picture
              image={portrait}
              alt="Rockson Kwesi Owusu, in black and white, resting his chin on his hand"
              sizes="(min-width: 768px) min(44vw, 640px), 90vw"
              priority
              className="block w-[min(90vw,460px)] md:w-[min(44vw,640px)]"
            />
          </Develop>
        </div>
      </Sheet>

      {/* ---------- Featured ---------- */}
      <Sheet tone="chalk" aria-label={`Featured: ${featured.title}`} data-rail-label="Featured">
        <FeaturedSequence
          intro={
            <div>
              <p className="text-small text-graphite">Featured, live at Ho Technical University</p>
              <h2 className="wdth mt-3 text-h1 font-semibold" style={{ "--wdth": 115 } as React.CSSProperties}>
                {featured.title}
              </h2>
            </div>
          }
          steps={featured.story.slice(0, 4).map((step) => {
            const image = projectImage(featured.images, step.images[0]);
            const video = step.video && projectVideos(featured.images).find((v) => v.name === step.video);
            const still = (
              <Picture image={image} alt={step.alt} sizes="(min-width: 1024px) 60vw, 100vw" />
            );
            return {
              title: step.title,
              body: step.body,
              media: (
                <Develop>
                  <DeviceFrame device="desktop">
                    {video ? (
                      <LazyVideo
                        video={video}
                        label={`Walkthrough: ${step.body}`}
                        poster={<Picture image={video.poster} alt={step.alt} sizes="(min-width: 1024px) 60vw, 100vw" />}
                      />
                    ) : (
                      still
                    )}
                  </DeviceFrame>
                </Develop>
              ),
            };
          })}
          aside={
            <div className="space-y-6">
              <dl className="flex gap-12">
                {featured.figures!.slice(0, 2).map((f) => (
                  <div key={f.label} className="flex flex-col-reverse">
                    <dt className="max-w-[16ch] text-small text-graphite">{f.label}</dt>
                    <dd className="wdth text-h1 font-semibold" style={{ "--wdth": 110 } as React.CSSProperties}>
                      {f.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="max-w-[46ch] text-small text-graphite">
                Replaced a manual process that took weeks. {creditLine(featured)}.
              </p>
              <div className="flex gap-6 text-small">
                <Link href={`/work/${featured.slug}`} label={featured.title} className="link-underline font-semibold">
                  Read the case study
                </Link>
                <a href={featured.links!.live} target="_blank" rel="noreferrer" className="link-underline">
                  Open tts.htu.edu.gh
                </a>
              </div>
            </div>
          }
        />
      </Sheet>

      {/* ---------- Work ---------- */}
      <Sheet tone="bone" aria-labelledby="work-title" data-rail-label="Work">
        <WorkGallery
          heading={
            <h2 id="work-title" className="wdth text-h1 font-semibold" style={{ "--wdth": 115 } as React.CSSProperties}>
              More work
            </h2>
          }
          items={rest.map((p) => ({
            slug: p.slug,
            kind: p.kind,
            card: <ProjectCard project={p} sizes="(min-width: 1024px) 30vw, 100vw" />,
          }))}
          end={
            <Link
              href="/work"
              label="Work"
              className="group flex aspect-[4/5] flex-col justify-end border-t border-ink pt-5 lg:aspect-auto lg:h-full"
            >
              <span className="stretch-on-hover wdth text-h2 font-semibold">All work</span>
              <span className="mt-2 text-small text-graphite">Every project, with filters and a list view.</span>
            </Link>
          }
        />
      </Sheet>

      {/* ---------- Teaching ---------- */}
      <Sheet tone="linen" aria-labelledby="teaching-title" data-rail-label="Teaching" className="flex flex-col justify-center px-gutter py-28">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <h2 id="teaching-title" className="wdth text-h1 font-semibold" style={{ "--wdth": 115 } as React.CSSProperties}>
              I also teach it
            </h2>
            <p className="mt-6 max-w-[42ch] text-graphite">
              Computer Science Department, Ho Technical University, November 2025 to October 2026 (national
              service). Besides the courses, I support final-year students with their theses and projects.
            </p>
          </div>
          <div className="md:col-span-7">
            <h3 className="text-small text-graphite">Courses</h3>
            <ul className="mt-3 border-t border-ink">
              {courses.map((c) => (
                <li key={c} className="group border-b border-haze py-3">
                  <span className="stretch-on-hover wdth text-h2 font-semibold">{c}</span>
                </li>
              ))}
            </ul>
            <h3 className="mt-12 text-small text-graphite">Computer Literacy, beyond Computer Science</h3>
            <p className="mt-3 max-w-[60ch] text-h3">{programmes.join(", ")}.</p>
          </div>
        </div>
      </Sheet>

      {/* ---------- Lab ---------- */}
      <Sheet tone="chalk" aria-labelledby="lab-title" className="flex flex-col justify-center py-28">
        <div className="px-gutter">
          <h2 id="lab-title" className="wdth text-h1 font-semibold" style={{ "--wdth": 115 } as React.CSSProperties}>
            Lab
          </h2>
          <p className="mt-4 max-w-[52ch] text-graphite">In progress, experiments and design work.</p>
        </div>
        <div className="mt-12">
          <Marquee items={stack} label="Tools I build with" />
        </div>
        <ul className="mt-14 grid gap-x-6 gap-y-14 px-gutter md:grid-cols-12">
          {lab.map((item, i) => {
            const body = (
              <>
                {item.status && <p className="text-small text-graphite">{item.status}</p>}
                <h3
                  className={`stretch-on-hover wdth mt-2 font-semibold ${i === 0 ? "text-[clamp(2.75rem,7vw,6.5rem)] leading-[0.95]" : "text-h2"}`}
                >
                  {item.title}
                </h3>
                <p className="mt-4 max-w-[48ch] text-graphite">{item.summary}</p>
              </>
            );
            return (
              <li
                key={item.title}
                className={`border-t border-ink pt-5 ${i === 0 ? "md:col-span-7 md:row-span-2" : "md:col-span-5 md:col-start-8"}`}
              >
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noreferrer" className="group block">
                    {body}
                  </a>
                ) : (
                  <div className="group">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </Sheet>
    </>
  );
}
