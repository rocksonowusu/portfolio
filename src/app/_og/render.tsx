import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Fonts for next/og (the favicon and app icon). Satori reads WOFF/TTF but not WOFF2, hence the
// static Archivo files here. Share images are rendered separately by scripts/build-og.mjs.

const dir = join(process.cwd(), "src/app/_og");
const [semibold, regular] = await Promise.all([
  readFile(join(dir, "Archivo-Expanded-SemiBold.woff")),
  readFile(join(dir, "Archivo-Regular.woff")),
]);

export const fonts = [
  { name: "Archivo Expanded", data: semibold, weight: 600 as const, style: "normal" as const },
  { name: "Archivo", data: regular, weight: 400 as const, style: "normal" as const },
];

export const ink = "#000000";
export const paper = "#FFFFFF";
