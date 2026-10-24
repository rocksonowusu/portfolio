#!/usr/bin/env node
// Share images (§9), rendered once into public/og/: one per case study (cover + title + credits)
// and default.jpg for every other page (portrait + name). JPEG under ~300 KB so WhatsApp, where
// most links get shared, shows the preview.
// Static files rather than a dynamic opengraph-image route: Next renders those per request on the
// server, where public/ and the fonts are not reliably on disk.
//
//   node scripts/build-og.mjs        (after `npm run images`; re-run when project content changes)

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import sharp from "sharp";
import { ImageResponse } from "next/og.js";
import { creditLine, projects } from "../src/content/projects.ts";
import { site } from "../src/content/site.ts";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public/og");
const SIZE = { width: 1200, height: 630 };
const INK = "#000000";
const PAPER = "#FFFFFF";
const GRAPHITE = "#5F6262";

const font = (file) => readFileSync(path.join(ROOT, "src/app/_og", file));
const fonts = [
  { name: "Archivo Expanded", data: font("Archivo-Expanded-SemiBold.woff"), weight: 600, style: "normal" },
  { name: "Archivo", data: font("Archivo-Regular.woff"), weight: 400, style: "normal" },
];
const manifest = JSON.parse(readFileSync(path.join(ROOT, "src/content/images.generated.json"), "utf8"));

/** Satori draws PNG/JPEG only: convert the pipeline's WebP. */
async function jpeg(entry, { grey = false } = {}) {
  const width = entry.widths.find((w) => w >= 1000) ?? entry.widths.at(-1);
  let img = sharp(path.join(ROOT, "public", `${entry.src}-${width}.webp`));
  if (grey) img = img.grayscale();
  const buf = await img.jpeg({ quality: 82 }).toBuffer();
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

async function write(name, tree) {
  const png = Buffer.from(await new ImageResponse(tree, { ...SIZE, fonts }).arrayBuffer());
  const jpg = await sharp(png).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
  writeFileSync(path.join(OUT, `${name}.jpg`), jpg);
  console.log(`og/${name}.jpg  ${Math.round(jpg.length / 1024)} KB`);
}

const text = (family, size, color, children, extra = {}) =>
  h("div", { style: { fontFamily: family, fontSize: size, color, ...extra } }, children);

mkdirSync(OUT, { recursive: true });

for (const p of projects) {
  const cover = manifest.projects[p.images].find((e) => e.name === p.cover.image);
  const credits = creditLine(p);
  const meta = [p.kind.join(", "), p.year, p.status === "Live" ? "Live" : null].filter(Boolean);
  // longest word decides the size: a single long word can't wrap (Archivo Expanded ≈ 0.72em a letter)
  const longest = Math.max(...p.title.split(" ").map((w) => w.length));
  const titleSize = Math.min(72, Math.floor(480 / (longest * 0.72)));

  const tree = h(
    "div",
    { style: { display: "flex", width: "100%", height: "100%", background: PAPER } },
    h(
      "div",
      { style: { display: "flex", flexDirection: "column", justifyContent: "space-between", width: 600, padding: 60 } },
      text("Archivo", 24, GRAPHITE, "Rockson Kwesi Owusu"),
      h(
        "div",
        { style: { display: "flex", flexDirection: "column" } },
        text("Archivo Expanded", titleSize, INK, p.title, { lineHeight: 0.98 }),
        credits ? text("Archivo", 24, GRAPHITE, credits, { lineHeight: 1.4, marginTop: 24 }) : null,
      ),
      h(
        "div",
        { style: { display: "flex", gap: 32, borderTop: `2px solid ${INK}`, paddingTop: 16 } },
        ...meta.map((m) => text("Archivo", 22, INK, m)),
      ),
    ),
    h("img", {
      src: await jpeg(cover),
      width: 600,
      height: 630,
      style: { objectFit: "cover", objectPosition: p.cover.focus ?? "50% 50%" },
    }),
  );

  await write(p.slug, tree);
}

const portrait = manifest.me.find((e) => e.name === "portrait-square");
await write(
  "default",
  h(
    "div",
    { style: { display: "flex", width: "100%", height: "100%", background: PAPER } },
    h(
      "div",
      { style: { display: "flex", flexDirection: "column", justifyContent: "space-between", width: 640, padding: 64 } },
      text("Archivo", 24, GRAPHITE, "Portfolio"),
      h(
        "div",
        { style: { display: "flex", flexDirection: "column" } },
        text("Archivo Expanded", 76, INK, site.name, { lineHeight: 0.95 }),
        text("Archivo", 28, GRAPHITE, site.intro, { lineHeight: 1.35, marginTop: 28 }),
      ),
    ),
    h("img", { src: await jpeg(portrait, { grey: true }), width: 560, height: 630, style: { objectFit: "cover" } }),
  ),
);
