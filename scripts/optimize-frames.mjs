/**
 * Turn assets/frames/<sequence>/ezgif-frame-NNN.jpg into the WebP sets the
 * landing page scrubs through.
 *
 *   node scripts/optimize-frames.mjs
 *
 * Re-run it whenever the source videos change. Output goes to
 * public/seq/<sequence>/<width>/NNN.webp and is gitignored — it is derived,
 * not authored.
 *
 * Two widths exist because a scroll-scrubbed sequence decodes every frame it
 * passes: shipping the 1280px set to a phone spends its decode budget on
 * pixels the screen cannot show.
 */

import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SOURCE = "assets/frames";
const OUT = "public/seq";
const WIDTHS = [1280, 640];
const QUALITY = { 1280: 80, 640: 74 };

const sequences = await readdir(SOURCE);
const manifest = {};

for (const sequence of sequences) {
  const files = (await readdir(path.join(SOURCE, sequence)))
    .filter((f) => /\.(jpe?g|png)$/i.test(f))
    .sort();

  manifest[sequence] = files.length;
  console.log(`${sequence}: ${files.length} frames`);

  for (const width of WIDTHS) {
    const dir = path.join(OUT, sequence, String(width));
    await rm(dir, { recursive: true, force: true });
    await mkdir(dir, { recursive: true });

    await Promise.all(
      files.map((file, index) =>
        sharp(path.join(SOURCE, sequence, file))
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: QUALITY[width], effort: 5 })
          .toFile(path.join(dir, `${String(index + 1).padStart(3, "0")}.webp`)),
      ),
    );
    console.log(`  -> ${width}px done`);
  }
}

await writeFile(
  path.join(OUT, "manifest.json"),
  JSON.stringify({ widths: WIDTHS, counts: manifest }, null, 2),
);
console.log("manifest written");
