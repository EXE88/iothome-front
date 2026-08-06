/** The catalogue, exactly as `/api/purchases/products/` returns it. */

import { API_BASE_SERVER } from "./config";
import type { GadgetType } from "./gadgetTypes";
import type { Locale } from "./i18n";

export type Product = {
  id: number;
  name: string;
  /** Persian copy, written alongside the English in the admin. May be empty. */
  name_fa: string;
  slug: string;
  description: string;
  description_fa: string;
  image_url: string;
  /** Toman, as a decimal string — the backend never sends it as a number. */
  price: string;
  stock: number;
  is_available: boolean;
  /** The gadget type's slug, which is what ties a listing to its capabilities. */
  gadget_type: string;
  mode: "telemetry" | "action" | "hybrid";
};

/**
 * The product photograph.
 *
 * `image_url` is empty for every seeded product and pointing it at a remote
 * host would break the no-remote-dependencies rule the build enforces, so the
 * first frame of that device's own render sequence stands in. The sequence
 * folder is named after the render, not the gadget type, hence the map.
 */
const SEQUENCE_BY_TYPE: Record<string, string> = {
  thermometer: "termometer",
  "smart-lamp": "lamp",
  camera: "camera",
};

/**
 * A product's name and description in the reader's language.
 *
 * Falls back to the English column when the Persian one is empty, so a
 * product added in a hurry still shows something. `dir="auto"` belongs on
 * whatever renders the result: an English sentence inside an RTL paragraph
 * puts its full stop at the wrong end otherwise.
 */
export function copyFor(product: Product, locale: Locale) {
  if (locale === "fa") {
    return {
      name: product.name_fa || product.name,
      description: product.description_fa || product.description,
      translated: Boolean(product.name_fa),
    };
  }
  return {
    name: product.name,
    description: product.description,
    translated: true,
  };
}

export function imageFor(product: Product, width: 640 | 1280 = 640) {
  if (product.image_url) return product.image_url;
  const sequence = SEQUENCE_BY_TYPE[product.gadget_type];
  return sequence ? `/seq/${sequence}/${width}/001.webp` : null;
}

/**
 * Fetch the catalogue on the server.
 *
 * `no-store` because stock counts are on these rows: a page cached at build
 * time would offer something that sold out an hour ago. The listing endpoint
 * is public, so no token is involved.
 *
 * A dead backend returns an empty list rather than throwing — the shop then
 * renders its empty state instead of the whole route 500ing.
 */
export async function fetchProducts(): Promise<Product[] | null> {
  try {
    const response = await fetch(`${API_BASE_SERVER}/api/purchases/products/`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = await response.json();
    return (data.results ?? data) as Product[];
  } catch {
    return null;
  }
}

/**
 * The capability contract, for the product page's "what it does" lists.
 *
 * The endpoint is public — it is the technical half of the catalogue, read by
 * people who have not signed up. The panel fetches the same thing with a
 * token, because it is already holding one.
 */
export async function fetchGadgetType(slug: string) {
  try {
    const response = await fetch(`${API_BASE_SERVER}/api/gadgets/types/`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = await response.json();
    const list: GadgetType[] = data.results ?? data;
    return list.find((type) => type.slug === slug) ?? null;
  } catch {
    return null;
  }
}

export async function fetchProduct(slug: string): Promise<Product | null> {
  try {
    const response = await fetch(
      `${API_BASE_SERVER}/api/purchases/products/${encodeURIComponent(slug)}/`,
      { cache: "no-store" },
    );
    if (!response.ok) return null;
    return (await response.json()) as Product;
  } catch {
    return null;
  }
}
