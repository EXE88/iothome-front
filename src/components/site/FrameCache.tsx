"use client";

import { useEffect } from "react";
import { registerFrameCache } from "@/lib/frameCache";

/**
 * Registers the frame-cache worker.
 *
 * Registration only. The re-check against the manifest is driven from
 * `usePreload`, because the page has to *wait* for that re-check before it
 * asks for a single frame — see `lib/frameCache.ts`.
 */
export default function FrameCache() {
  useEffect(() => {
    registerFrameCache();
  }, []);

  return null;
}
