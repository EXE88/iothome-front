import type { NextConfig } from "next";

/**
 * Hosts allowed to pull `/_next/*` in development, straight from `.env`.
 *
 * The dev server refuses those requests under a host it does not recognise,
 * which is what happens when a phone opens the site over the LAN or a VPN:
 * the HTML renders, then every chunk, font and optimized image is blocked and
 * the page comes up half-built. Add the host you type in the address bar to
 * DEV_ORIGINS and restart.
 *
 * Development only — `next start` ignores it.
 */
const devOrigins = (process.env.DEV_ORIGINS ?? "localhost,127.0.0.1")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  // The dev badge sits over the hero's corner and lands in every screenshot
  // taken of this page.
  devIndicators: false,
  allowedDevOrigins: devOrigins,
};

export default nextConfig;
