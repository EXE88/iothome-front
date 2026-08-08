/**
 * Write `public/asset-manifest.json` — every landing asset with a content hash.
 *
 *   node scripts/build-asset-manifest.mjs
 *
 * This is what makes the service worker's cache track the server instead of
 * freezing. A version stamp on the whole cache would be simpler and wrong: any
 * deploy would throw away all 4.8 MB and re-download frames that never changed.
 * A hash per file means the worker can keep what still matches, refetch only
 * what actually moved, and delete what is no longer listed at all.
 *
 * The hash is over the bytes, so a rebuild that produces identical files
 * produces an identical manifest and nothing is re-downloaded.
 *
 * Runs as part of `npm run build`; the output is gitignored because it is
 * derived, exactly like the frames it describes.
 */

import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, posix, relative, sep } from "node:path";

const PUBLIC_DIR = new URL("../public/", import.meta.url).pathname.replace(
  /^\/([A-Za-z]:)/,
  "$1",
);

/**
 * What the landing page needs before it can be scrubbed without stuttering.
 * Deliberately not "everything in public/": the auth art and the leftover
 * starter SVGs are not on this page, and precaching them would spend a
 * visitor's bandwidth on files they may never open.
 */
const ROOTS = ["seq"];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function hash(file) {
  return createHash("sha1").update(readFileSync(file)).digest("hex").slice(0, 12);
}

const assets = {};
let bytes = 0;

for (const root of ROOTS) {
  const base = join(PUBLIC_DIR, root);
  let files;
  try {
    files = walk(base);
  } catch {
    console.warn(`asset-manifest: ${root}/ is missing — run \`npm run frames\``);
    continue;
  }

  for (const file of files) {
    // The manifest describes URLs, not disk paths, so separators are forced to
    // posix — on Windows these would otherwise be backslashes and match
    // nothing the browser ever requests.
    const url = "/" + relative(PUBLIC_DIR, file).split(sep).join(posix.sep);
    if (url.endsWith(".json")) continue; // describes the frames, is not one
    assets[url] = hash(file);
    bytes += statSync(file).size;
  }
}

const urls = Object.keys(assets).sort();
const manifest = {
  // Changes whenever any file's content changes, so the worker can tell in one
  // comparison whether there is anything to reconcile at all.
  revision: createHash("sha1")
    .update(urls.map((u) => `${u}:${assets[u]}`).join("\n"))
    .digest("hex")
    .slice(0, 12),
  assets: Object.fromEntries(urls.map((u) => [u, assets[u]])),
};

writeFileSync(
  join(PUBLIC_DIR, "asset-manifest.json"),
  JSON.stringify(manifest, null, 0) + "\n",
);

console.log(
  `asset-manifest: ${urls.length} files, ${(bytes / 1024 / 1024).toFixed(1)} MB, revision ${manifest.revision}`,
);
