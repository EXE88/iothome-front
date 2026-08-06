/**
 * Fail if anything in the app would load a font, script, style or image from
 * a host other than this one.
 *
 *   node scripts/check-no-remote.mjs
 *
 * Runs as part of `npm run verify`. The page is meant to be servable from a
 * machine with no route to the internet, and that property is easy to lose by
 * accident — one `next/font/google` import or one CDN <link> is all it takes,
 * and neither shows up as an error anywhere.
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const ROOTS = ["src"];
const EXTENSIONS = /\.(tsx?|jsx?|css|mjs)$/;

// Loading from these is the thing being prevented.
const RULES = [
  {
    id: "next/font/google",
    test: /from\s+["']next\/font\/google["']/,
    hint: "fetches font files from Google at build time — use next/font/local with files under src/app/fonts",
  },
  {
    id: "remote url",
    // Any absolute http(s) URL that is not a bare reference in a comment.
    test: /["'`](https?:)?\/\/(?!localhost|127\.0\.0\.1)[^"'`\s]+\.(woff2?|ttf|otf|css|js|mjs|png|jpe?g|webp|svg|gif)/i,
    hint: "asset served from another host — download it into the repository instead",
  },
  {
    id: "cdn host",
    test: /(fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr\.net|unpkg\.com|cdnjs\.cloudflare\.com)/,
    hint: "CDN reference in application code",
  },
];

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      yield* walk(full);
    } else if (EXTENSIONS.test(entry.name)) {
      yield full;
    }
  }
}

const failures = [];

for (const root of ROOTS) {
  for await (const file of walk(root)) {
    const source = await readFile(file, "utf8");
    source.split("\n").forEach((line, index) => {
      // The vendoring script is allowed to name its sources; it is a tool the
      // developer runs, not something the app loads.
      if (file.includes("scripts")) return;
      for (const rule of RULES) {
        if (rule.test.test(line)) {
          failures.push(`${file}:${index + 1}  [${rule.id}] ${rule.hint}\n    ${line.trim()}`);
        }
      }
    });
  }
}

if (failures.length) {
  console.error(`Remote dependencies found (${failures.length}):\n`);
  failures.forEach((f) => console.error(f + "\n"));
  process.exit(1);
}

console.log("No remote dependencies: every font, script and style is served from this app.");
