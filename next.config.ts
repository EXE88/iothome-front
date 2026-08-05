import os from "node:os";
import type { NextConfig } from "next";

/**
 * Hosts allowed to pull `/_next/*` in development.
 *
 * The dev server refuses those requests when they arrive under a host it does
 * not recognise, which is exactly what happens when a phone opens the site
 * over Tailscale or the LAN: the HTML renders, then every chunk, font and
 * optimized image is blocked, so the page comes up half-built.
 *
 * Three sources, because none of them is enough alone:
 *  - this machine's own IPv4 addresses, so the LAN case needs no setup;
 *  - the Tailscale range (100.64.0.0/10), because the tailnet address is not
 *    on the interface list until Tailscale is actually connected, which is
 *    usually after the dev server started;
 *  - DEV_ORIGINS, for a MagicDNS name or anything else not covered above.
 *
 * Development only — `next start` ignores it.
 */
function devOrigins(): string[] {
  const origins = new Set<string>(["localhost", "127.0.0.1"]);

  for (const addresses of Object.values(os.networkInterfaces())) {
    for (const net of addresses ?? []) {
      if (net.family === "IPv4" && !net.internal) origins.add(net.address);
    }
  }

  // 100.64.x – 100.127.x is the CGNAT block Tailscale assigns from.
  for (let second = 64; second <= 127; second++) {
    origins.add(`100.${second}.*.*`);
  }

  for (const extra of (process.env.DEV_ORIGINS ?? "").split(",")) {
    const host = extra.trim();
    if (host) origins.add(host);
  }

  return [...origins];
}

const nextConfig: NextConfig = {
  // The dev badge sits over the hero's corner and lands in every screenshot
  // taken of this page.
  devIndicators: false,
  allowedDevOrigins: devOrigins(),
};

export default nextConfig;
