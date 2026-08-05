"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useFrameSequence } from "@/lib/useFrameSequence";
import type { Dictionary } from "@/lib/i18n";

gsap.registerPlugin(ScrollTrigger);

type DeviceKey = "thermometer" | "lamp" | "camera";

const SEQUENCES: Record<DeviceKey, string> = {
  thermometer: "termometer", // the source folder's spelling
  lamp: "lamp",
  camera: "camera",
};

const ICONS: Record<DeviceKey, string> = {
  thermometer: "bi-thermometer-half",
  lamp: "bi-lightbulb",
  camera: "bi-camera-video",
};

const ORDER: DeviceKey[] = ["thermometer", "lamp", "camera"];

type PanelHandle = {
  element: HTMLElement | null;
  draw: (progress: number) => void;
};

function DevicePanel({
  device,
  dict,
  active,
  register,
}: {
  device: DeviceKey;
  dict: Dictionary;
  active: boolean;
  register: (device: DeviceKey, handle: PanelHandle) => void;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const { canvasRef, draw } = useFrameSequence({
    sequence: SEQUENCES[device],
    enabled: active,
    // The subject occupies about half of its 16:9 frame; cropping into the
    // surrounding backdrop is free, since the same sweep continues in CSS.
    zoom: 1.35,
  });
  const copy = dict.devices[device];

  useEffect(() => {
    register(device, { element: rootRef.current, draw });
  }, [register, device, draw]);

  return (
    <figure ref={rootRef} className="flex flex-col">
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl studio">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full studio-fade"
          aria-hidden="true"
        />
        <i
          className={`bi ${ICONS[device]} absolute start-5 top-5 text-lg text-ink`}
          aria-hidden="true"
        />
      </div>
      <figcaption className="mt-5">
        <h3 className="text-[1.3rem] font-semibold tracking-[-0.02em]">
          {copy.name}
        </h3>
        <p className="mt-2 text-[0.96rem] leading-relaxed text-ink-soft">
          {copy.line}
        </p>
        <p className="mt-1.5 text-[0.9rem] leading-relaxed text-ink-faint">
          {copy.detail}
        </p>
      </figcaption>
    </figure>
  );
}

/**
 * The house has just finished; three strands split out of it and each becomes
 * a device that assembles itself.
 *
 * On a wide screen that happens in one pinned frame with all three advancing
 * together, which is the point of the split. A phone cannot show three useful
 * renders side by side — at 375px each would be barely a hundred pixels wide —
 * so there the section stops pinning and each device assembles as it scrolls
 * past, one at a time.
 */
export default function DeviceTrio({ dict }: { dict: Dictionary }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<SVGSVGElement>(null);
  const handles = useRef(new Map<DeviceKey, PanelHandle>());
  const [active, setActive] = useState(false);

  const register = useCallback((device: DeviceKey, handle: PanelHandle) => {
    handles.current.set(device, handle);
  }, []);

  // Three sequences is 3.2MB on desktop: worth fetching as the section comes
  // into range, not on the page's first paint.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { rootMargin: "80% 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !active) return;

    const paintAll = (progress: number) => {
      handles.current.forEach((handle) => handle.draw(progress));
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = window.setTimeout(() => paintAll(1), 300);
      return () => window.clearTimeout(id);
    }

    const media = gsap.matchMedia();

    media.add("(min-width: 640px)", () => {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => paintAll(self.progress),
      });

      // The strands draw themselves as the section arrives, so the devices
      // read as having come out of the house rather than replacing it.
      linesRef.current?.querySelectorAll("path").forEach((path) => {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(path, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        });
      });
    });

    media.add("(max-width: 639px)", () => {
      handles.current.forEach((handle) => {
        if (!handle.element) return;
        ScrollTrigger.create({
          trigger: handle.element,
          start: "top 85%",
          end: "bottom 55%",
          scrub: true,
          onUpdate: (self) => handle.draw(self.progress),
        });
      });
    });

    return () => media.revert();
  }, [active]);

  return (
    <section
      id="devices"
      ref={sectionRef}
      className="relative bg-paper sm:h-[320vh]"
      aria-labelledby="devices-title"
    >
      <div className="flex flex-col justify-center overflow-hidden py-20 sm:sticky sm:top-0 sm:h-screen sm:py-0">
        <div className="mx-auto w-full max-w-6xl px-6 sm:px-10 sm:pt-20">
          {/* The finished house is carried across the section boundary and
              held here. Without it the strands fan out of blank paper and the
              split has nothing to split from. */}
          <div className="flex items-end justify-between gap-6">
            <div className="max-w-md">
              <h2
                id="devices-title"
                className="text-balance text-[clamp(1.9rem,3.4vw,2.7rem)] font-semibold leading-[1.05] tracking-[-0.035em]"
              >
                {dict.devices.title}
              </h2>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-soft">
                {dict.devices.lead}
              </p>
            </div>

            {/* Given the same studio panel as the three devices below it: the
                render carries its own grey backdrop, which on white paper
                would otherwise read as a smudge rather than as the parent of
                the three panels the strands run to. */}
            <div className="relative hidden aspect-4/3 w-[15rem] shrink-0 overflow-hidden rounded-2xl studio sm:block lg:w-[18rem]">
              <img
                src="/seq/house/640/001.webp"
                alt=""
                aria-hidden="true"
                className="h-full w-full select-none object-cover studio-fade"
              />
            </div>
          </div>

          {/* The three strands leaving that house, inside the same content
              column as the grid so each one lands on the panel it belongs to. */}
          <svg
            ref={linesRef}
            className="strands mt-2 hidden h-16 w-full sm:block"
            viewBox="0 0 1200 64"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M1055 0 C1055 40 197 20 197 64"
              fill="none"
              stroke="var(--line-strong)"
              strokeWidth="1.25"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M1055 0 C1055 40 600 20 600 64"
              fill="none"
              stroke="var(--line-strong)"
              strokeWidth="1.25"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M1055 0 C1055 30 1003 30 1003 64"
              fill="none"
              stroke="var(--line-strong)"
              strokeWidth="1.25"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* The phone cannot hold the house and three panels in one frame, so
              it gets the same idea in its own form: the house, then a strand
              running into the first device. */}
          <div className="mt-8 flex flex-col items-center sm:hidden">
            <div className="relative aspect-4/3 w-full max-w-[20rem] overflow-hidden rounded-2xl studio">
              <img
                src="/seq/house/640/001.webp"
                alt=""
                aria-hidden="true"
                className="h-full w-full select-none object-cover studio-fade"
              />
            </div>
            <span
              className="mt-1 block h-10 w-px bg-[var(--line-strong)]"
              aria-hidden="true"
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-12 sm:mt-0 sm:grid-cols-3 sm:gap-5">
            {ORDER.map((device) => (
              <DevicePanel
                key={device}
                device={device}
                dict={dict}
                active={active}
                register={register}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
