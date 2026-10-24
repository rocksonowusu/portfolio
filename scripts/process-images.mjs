#!/usr/bin/env node
// Image + video pipeline (CLAUDE.md §8).
//
//   node scripts/process-images.mjs           only re-encodes files whose outputs are missing or stale
//   node scripts/process-images.mjs --force   re-encodes everything
//
// Reads   raw/projects/<delivered folder>/**   and   raw/me/processed/*.png (from scripts/portrait.py)
// Writes  public/images/<slug>/<name>-<width>.{avif,webp}
//         public/video/<slug>/<name>.{mp4,webm} + poster images
//         src/content/images.generated.json

import { execFileSync } from "node:child_process";
import { existsSync, globSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { cpus } from "node:os";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const RAW_PROJECTS = path.join(ROOT, "raw/projects");
const RAW_ME = path.join(ROOT, "raw/me/processed");
const OUT_IMAGES = path.join(ROOT, "public/images");
const OUT_VIDEO = path.join(ROOT, "public/video");
const OUT_JSON = path.join(ROOT, "src/content/images.generated.json");
const FORCE = process.argv.includes("--force");

/** Delivered folder name → project slug. */
const FOLDERS = {
  "HTU Timetabling Suite": "htu-timetabling-suite",
  "HTU Caf (Images)": "htu-cafeteria",
  "CurrentWatch Project": "currentwatch",
  "Estimate Pro": "estimatepro",
  GhanaExperience: "ghana-experience",
  "Respira AI": "respira-ai",
  Carfinder: "carfinder",
};

/** Delivered files that are corrupt (checked 2026-10-24). */
const SKIP = new Set(["Screenshot_20250831-152856.jpg", "Screenshot_20250831-153316.jpg"]);

/** Subfolders holding camera photos rather than screenshots. */
const PHOTO_GROUPS = new Set(["hardware"]);

const WIDTHS = [640, 1280, 2048];
const IMAGE_EXT = /\.(png|jpe?g|webp)$/i;
const VIDEO_EXT = /\.(mp4|mov|webm)$/i;

// ---------- helpers ----------

const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

const kebab = (s) =>
  s
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** "timetable_resolver3(walkthrough).png.mp4" → "timetable_resolver3(walkthrough)" */
const stem = (file) => {
  let s = path.basename(file);
  while (IMAGE_EXT.test(s) || VIDEO_EXT.test(s)) s = s.replace(/\.[^.]+$/, "");
  return s;
};

/** Every target width below the source, plus the source itself capped at the largest target. Never upscales. */
const widthsFor = (width) => {
  const ws = WIDTHS.filter((w) => w < width);
  ws.push(Math.min(width, WIDTHS.at(-1)));
  return ws;
};

const isFresh = (outputs, source) => {
  if (FORCE) return false;
  const srcTime = statSync(source).mtimeMs;
  return outputs.every((o) => existsSync(o) && statSync(o).mtimeMs >= srcTime);
};

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)],
  );

/** Runs `task` over `items` with at most `n` in flight, preserving result order. */
async function pool(items, n, task) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await task(items[i], i);
      }
    }),
  );
  return results;
}

let encoded = 0;
let reused = 0;

/**
 * Encodes one source image into AVIF + WebP at each width (plus a PNG for transparent images)
 * and returns its manifest entry.
 */
async function processImage({ source, outDir, publicDir, name, group, photo }) {
  // .rotate() applies EXIF orientation so phone photos come out upright
  const base = sharp(source, { failOn: "error" }).rotate();
  const { width, height, hasAlpha } = await base.metadata().then(async (m) => {
    const o = m.orientation ?? 1;
    const swap = o >= 5 && o <= 8;
    return { width: swap ? m.height : m.width, height: swap ? m.width : m.height, hasAlpha: m.hasAlpha };
  });

  const widths = widthsFor(width);
  const outputs = widths.flatMap((w) => [
    path.join(outDir, `${name}-${w}.avif`),
    path.join(outDir, `${name}-${w}.webp`),
  ]);
  const pngOut = hasAlpha ? path.join(outDir, `${name}.png`) : null;
  if (pngOut) outputs.push(pngOut);

  if (isFresh(outputs, source)) {
    reused++;
  } else {
    // screenshots keep full chroma so small UI text and coloured badges stay crisp
    const avif = photo ? { quality: 55, effort: 5 } : { quality: 62, effort: 5, chromaSubsampling: "4:4:4" };
    await Promise.all(
      widths.flatMap((w) => {
        const resized = base.clone().resize({ width: w, withoutEnlargement: true });
        return [
          resized.clone().avif(avif).toFile(path.join(outDir, `${name}-${w}.avif`)),
          resized.clone().webp({ quality: photo ? 78 : 82, alphaQuality: 90 }).toFile(path.join(outDir, `${name}-${w}.webp`)),
        ];
      }),
    );
    if (pngOut) {
      await base.clone().resize({ width: widths.at(-1) }).png({ compressionLevel: 9, palette: false }).toFile(pngOut);
    }
    encoded++;
  }

  const blur = await base.clone().resize({ width: 16 }).webp({ quality: 40 }).toBuffer();
  const aspect = +(width / height).toFixed(4);

  return {
    name,
    group,
    src: `${publicDir}/${name}`,
    width,
    height,
    aspect,
    widths,
    formats: hasAlpha ? ["avif", "webp", "png"] : ["avif", "webp"],
    device: photo ? "photo" : aspect < 0.7 ? "phone" : "desktop",
    blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
  };
}

// ---------- video ----------

function findFfmpeg() {
  const candidates = [
    process.env.FFMPEG,
    ...globSync(
      path
        .join(process.env.LOCALAPPDATA ?? "", "Microsoft/WinGet/Packages/Gyan.FFmpeg*/*/bin/ffmpeg.exe")
        .replaceAll("\\", "/"),
    ),
    "ffmpeg",
  ].filter(Boolean);
  for (const bin of candidates) {
    try {
      execFileSync(bin, ["-version"], { stdio: "ignore" });
      return bin;
    } catch {}
  }
  return null;
}

async function processVideo({ source, slug, name, ffmpeg }) {
  const outDir = path.join(OUT_VIDEO, slug);
  mkdirSync(outDir, { recursive: true });
  const mp4 = path.join(outDir, `${name}.mp4`);
  const webm = path.join(outDir, `${name}.webm`);
  // the full-size poster frame is an intermediate: keep it out of public/
  const cacheDir = path.join(ROOT, "raw/.cache/video", slug);
  mkdirSync(cacheDir, { recursive: true });
  const posterPng = path.join(cacheDir, `${name}-poster.png`);

  // no audio track: the videos play muted and inline
  const scale = "scale='min(1920,iw)':-2";
  if (!isFresh([mp4], source)) {
    console.log(`  ffmpeg  ${slug}/${name}.mp4`);
    execFileSync(ffmpeg, ["-y", "-v", "error", "-i", source, "-an", "-vf", scale, "-c:v", "libx264",
      "-preset", "slow", "-crf", "24", "-profile:v", "high", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4]);
  }
  if (!isFresh([webm], source)) {
    console.log(`  ffmpeg  ${slug}/${name}.webm`);
    execFileSync(ffmpeg, ["-y", "-v", "error", "-i", source, "-an", "-vf", scale, "-c:v", "libvpx-vp9",
      "-crf", "36", "-b:v", "0", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", webm]);
  }
  if (!isFresh([posterPng], source)) {
    execFileSync(ffmpeg, ["-y", "-v", "error", "-ss", "2", "-i", source, "-frames:v", "1", "-vf", scale, posterPng]);
  }

  const poster = await processImage({
    source: posterPng,
    outDir,
    publicDir: `/video/${slug}`,
    name: `${name}-poster`,
    group: "video",
    photo: false,
  });
  const probe = execFileSync(ffmpeg.replace(/ffmpeg(\.exe)?$/, "ffprobe$1"), [
    "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", source,
  ]).toString();

  return {
    name,
    mp4: `/video/${slug}/${name}.mp4`,
    webm: `/video/${slug}/${name}.webm`,
    width: poster.width,
    height: poster.height,
    duration: +(+probe).toFixed(1),
    poster,
  };
}

// ---------- main ----------

const manifest = { projects: {}, me: [], videos: {} };
const ffmpeg = findFfmpeg();
const parallel = Math.max(2, Math.min(4, cpus().length - 1));

for (const [folder, slug] of Object.entries(FOLDERS)) {
  const dir = path.join(RAW_PROJECTS, folder);
  if (!existsSync(dir)) {
    console.warn(`! missing ${folder}`);
    continue;
  }
  const files = walk(dir).sort((a, b) => collator.compare(path.relative(dir, a), path.relative(dir, b)));
  const outDir = path.join(OUT_IMAGES, slug);
  mkdirSync(outDir, { recursive: true });

  const taken = new Set();
  const jobs = [];
  const videos = [];
  for (const source of files) {
    const file = path.basename(source);
    if (SKIP.has(file)) {
      console.log(`  skip    ${folder}/${file} (corrupt)`);
      continue;
    }
    const rel = path.relative(dir, path.dirname(source));
    const group = rel ? kebab(rel) : "main";
    let name = kebab(stem(file));
    if (taken.has(name)) name = `${group}-${name}`;
    taken.add(name);

    if (IMAGE_EXT.test(file)) {
      jobs.push({ source, outDir, publicDir: `/images/${slug}`, name, group, photo: PHOTO_GROUPS.has(group) });
    } else if (VIDEO_EXT.test(file)) {
      videos.push({ source, slug, name });
    }
  }

  manifest.projects[slug] = (
    await pool(jobs, parallel, (job) =>
      processImage(job).catch((err) => {
        console.warn(`! failed ${path.relative(ROOT, job.source)}: ${err.message}`);
        return null;
      }),
    )
  ).filter(Boolean);

  if (videos.length) {
    if (!ffmpeg) {
      console.warn("! ffmpeg not found (set FFMPEG=path/to/ffmpeg): skipping videos");
    } else {
      manifest.videos[slug] = [];
      for (const v of videos) manifest.videos[slug].push(await processVideo({ ...v, ffmpeg }));
    }
  }
  console.log(`${slug}: ${manifest.projects[slug].length} images${videos.length ? `, ${videos.length} video` : ""}`);
}

if (existsSync(RAW_ME)) {
  const outDir = path.join(OUT_IMAGES, "me");
  mkdirSync(outDir, { recursive: true });
  const files = readdirSync(RAW_ME).filter((f) => IMAGE_EXT.test(f)).sort(collator.compare);
  manifest.me = await pool(files, parallel, (f) =>
    processImage({
      source: path.join(RAW_ME, f),
      outDir,
      publicDir: "/images/me",
      name: kebab(stem(f)),
      group: "me",
      photo: true,
    }),
  );
  console.log(`me: ${manifest.me.length} images`);
} else {
  console.warn("! raw/me/processed not found: run scripts/portrait.py first");
}

writeFileSync(OUT_JSON, JSON.stringify(manifest, null, 2) + "\n");
console.log(`\n${encoded} encoded, ${reused} up to date → ${path.relative(ROOT, OUT_JSON)}`);
