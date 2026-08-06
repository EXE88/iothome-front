"use client";

import { useEffect } from "react";

/**
 * Keeps the whole app on one hostname.
 *
 * `localhost:3000` and `127.0.0.1:3000` are one site to a person and two
 * sites to a browser. Each keeps its own cookie jar, so each keeps its own
 * login: sign out of one, sign in as somebody else, then type the other into
 * the address bar, and the first account is still sitting there — which reads
 * as the app silently swapping your account.
 *
 * `src/proxy.ts` does this at the edge, which is the right place and is what
 * runs in production. It cannot do it here: Next rewrites a redirect whose
 * target host it considers *itself*, and a dev server considers both of these
 * names itself, so the header collapses to a bare path and the browser loops
 * back to where it started. Hence a client-side guard as well — one navigation
 * later than ideal, but it closes the hole the edge cannot reach.
 *
 * Set NEXT_PUBLIC_SITE_ORIGIN to pin a host. Leave it empty when the site has
 * to answer on several addresses at once, such as testing from a phone.
 */
export default function CanonicalHost() {
  useEffect(() => {
    const configured = (process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "").replace(
      /\/$/,
      "",
    );
    if (!configured) return;

    let canonical: URL;
    try {
      canonical = new URL(configured);
    } catch {
      return; // Misconfigured; leave the visitor where they are.
    }

    if (window.location.host === canonical.host) return;

    // `replace`, not `assign`: the wrong host should not become a back-button
    // destination that bounces the visitor straight out again.
    window.location.replace(
      canonical.origin +
        window.location.pathname +
        window.location.search +
        window.location.hash,
    );
  }, []);

  return null;
}
