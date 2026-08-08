import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * The build's asset revision, read on the server.
 *
 * The preloader needs this in the very first byte of HTML: the inline script
 * that decides whether to show the splash compares it against what the browser
 * remembers finishing, and that decision has to be made before the first
 * paint. Passing it down as a prop is the only way it can be inlined into the
 * document.
 *
 * Cached against the file's mtime rather than for the life of the process. A
 * deploy restarts the process so a plain cache would usually be fine, but
 * regenerating the manifest against a running server is exactly what happens
 * during testing, and a stale revision there means the splash is skipped for
 * frames that have changed — the one thing this value exists to prevent.
 */
const MANIFEST = join(process.cwd(), "public", "asset-manifest.json");

let cache: { mtime: number; revision: string } | null = null;

export function assetRevision(): string {
  try {
    const mtime = statSync(MANIFEST).mtimeMs;
    if (cache?.mtime === mtime) return cache.revision;
    const revision = String(
      JSON.parse(readFileSync(MANIFEST, "utf8")).revision ?? "",
    );
    cache = { mtime, revision };
    return revision;
  } catch {
    // No manifest — `npm run manifest` has not run. The splash then behaves as
    // if nothing were ever cached, which is the safe direction to fail.
    return "";
  }
}
