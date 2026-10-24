import {
  siAndroid,
  siArduino,
  siCloudinary,
  siCpanel,
  siCplusplus,
  siDjango,
  siEspressif,
  siExpo,
  siFastapi,
  siHuggingface,
  siMicropython,
  siOpenjdk,
  siPython,
  siReact,
  siSupabase,
  siTypescript,
  siVite,
  type SimpleIcon,
} from "simple-icons";

// Brand marks from Simple Icons (CC0), drawn in ink like everything else: no brand colours.
// Keys are stack labels as written in projects.ts, lower-cased, without a trailing "(…)".
// MySQL is left out on purpose: its mark is mostly a wordmark that turns to a smudge at text size.
const icons: Record<string, SimpleIcon> = {
  android: siAndroid,
  arduino: siArduino,
  "c++": siCplusplus,
  cloudinary: siCloudinary,
  cpanel: siCpanel,
  django: siDjango,
  esp32: siEspressif,
  expo: siExpo,
  fastapi: siFastapi,
  "hugging face": siHuggingface,
  java: siOpenjdk,
  micropython: siMicropython,
  python: siPython,
  react: siReact,
  "react native": siReact,
  supabase: siSupabase,
  typescript: siTypescript,
  vite: siVite,
};

/** "React (Vite)" → React's mark; undefined for tools without one (e.g. Zustand). */
export const techIcon = (label: string) => icons[label.toLowerCase().replace(/\s*\(.*\)\s*$/, "")];
