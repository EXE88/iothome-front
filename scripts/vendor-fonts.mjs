/**
 * Download the two typefaces into the repository.
 *
 *   node scripts/vendor-fonts.mjs
 *
 * `next/font/google` self-hosts the files it serves, but it fetches them from
 * Google at *build* time, which makes every build depend on a network it may
 * not have. These files are committed instead, and the layout loads them with
 * `next/font/local`, so a clean checkout builds offline and nothing outside
 * this repository is ever contacted.
 *
 * Both families are variable fonts under the SIL Open Font License 1.1; the
 * licences are written next to them.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT = "src/app/fonts";

const FILES = [
  {
    name: "SchibstedGrotesk-Variable.woff2",
    // Latin + latin-ext, weights 400-900 in one variable file.
    url: "https://cdn.jsdelivr.net/fontsource/fonts/schibsted-grotesk:vf@latest/latin-wght-normal.woff2",
  },
  {
    name: "Vazirmatn-Variable.woff2",
    url: "https://cdn.jsdelivr.net/fontsource/fonts/vazirmatn:vf@latest/arabic-wght-normal.woff2",
  },
  {
    name: "Vazirmatn-Latin-Variable.woff2",
    url: "https://cdn.jsdelivr.net/fontsource/fonts/vazirmatn:vf@latest/latin-wght-normal.woff2",
  },
];

const LICENSES = [
  {
    name: "SchibstedGrotesk-OFL.txt",
    url: "https://raw.githubusercontent.com/google/fonts/main/ofl/schibstedgrotesk/OFL.txt",
  },
  {
    name: "Vazirmatn-OFL.txt",
    url: "https://raw.githubusercontent.com/rastikerdar/vazirmatn/master/OFL.txt",
  },
];

await mkdir(OUT, { recursive: true });

for (const asset of [...FILES, ...LICENSES]) {
  const response = await fetch(asset.url);
  if (!response.ok) {
    throw new Error(`${asset.name}: ${response.status} ${response.statusText}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(path.join(OUT, asset.name), bytes);
  console.log(`${asset.name}  ${(bytes.length / 1024).toFixed(0)} KB`);
}

console.log(`\nWritten to ${OUT}. These files are committed on purpose.`);
