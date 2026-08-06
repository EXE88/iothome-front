/**
 * Composite the auth screens' backdrop from a real render.
 *
 *   node scripts/build-auth-art.mjs
 *
 * The auth ground has to be the photographed house, not a CSS gradient
 * imitating the studio sweep it was shot on. A plain <img> cannot be used
 * directly: `object-contain` leaves the element box wider than the painted
 * image, so a CSS mask feathers the box and not the picture, and the frame's
 * own grey background shows up as a hard-edged rectangle.
 *
 * So the feather is baked in. The frame is cropped to the house, its alpha is
 * multiplied by a radial falloff, and the result is written as a WebP with
 * transparency that drops onto the studio ground with no seam at all.
 */

import sharp from "sharp";

const SOURCE = "assets/frames/house/ezgif-frame-001.jpg";
const OUT = "public/art/auth-house.webp";

// The house and its shadow inside the 1280x720 frame, with room to breathe.
const CROP = { left: 330, top: 150, width: 640, height: 520 };

const base = sharp(SOURCE).extract(CROP);
const { width, height } = { width: CROP.width, height: CROP.height };

// Opaque over the subject, gone by the edges. Slightly taller than wide so the
// shadow under the house survives the fade.
const mask = Buffer.from(
  `<svg width="${width}" height="${height}">
     <defs>
       <radialGradient id="feather" cx="50%" cy="52%" r="62%">
         <stop offset="0%" stop-color="#fff" stop-opacity="1"/>
         <stop offset="58%" stop-color="#fff" stop-opacity="1"/>
         <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
       </radialGradient>
     </defs>
     <rect width="${width}" height="${height}" fill="url(#feather)"/>
   </svg>`,
);

await base
  .ensureAlpha()
  .composite([{ input: mask, blend: "dest-in" }])
  .webp({ quality: 88, alphaQuality: 90 })
  .toFile(OUT);

const { size } = await sharp(OUT).metadata();
console.log(`${OUT}  ${Math.round((size ?? 0) / 1024)} KB  ${width}x${height}`);
