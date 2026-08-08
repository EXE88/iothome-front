import { assetRevision } from "@/lib/assetRevision";

/**
 * Decides, before the first paint, whether this visit gets a splash.
 *
 * It has to be an inline script and it has to run early. React cannot make
 * this call: by the time it hydrates, the browser has already drawn something,
 * and whichever way the decision goes one of the two flashes has happened —
 * either the landing page appears and is then covered, or the splash appears
 * over a page that needed no waiting.
 *
 * So the splash ships inside the HTML, visible by default, and this script
 * runs before the body is painted and hides it again when the browser can
 * prove it already finished loading this exact build. The marker is written by
 * `Preloader` on completion and keyed to the asset revision, so any change to
 * any frame brings the splash back until the new ones are in.
 *
 * Failing open — showing the splash — is the harmless direction: a visitor
 * waits a beat longer than necessary. Failing the other way shows a stuttering
 * page, which is the whole thing this exists to prevent.
 */
export default function PreloadGate() {
  const revision = assetRevision();

  // Written as a single expression with no template interpolation of anything
  // user-controlled: `revision` is a hex digest produced by our own build.
  const script = `try{if(localStorage.getItem('sl_frames_ready')===${JSON.stringify(
    revision,
  )})document.documentElement.dataset.preload='skip'}catch(e){}`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
