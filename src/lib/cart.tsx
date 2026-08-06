"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "./products";

/**
 * The basket.
 *
 * It lives in localStorage rather than on the server: the backend has no
 * concept of a basket, only of an order that has been placed, and inventing a
 * server-side one would mean a table whose rows nobody ever reads back. It
 * also means the basket survives a reload for a signed-out visitor, which is
 * exactly when people build one.
 *
 * Only the product id and quantity are stored. Name, price and stock are read
 * from the catalogue on every render, so a basket built yesterday cannot show
 * yesterday's price or offer something that has since sold out.
 */

const STORAGE_KEY = "sl_cart";
/** Matches the backend's per-line ceiling in BasketLineSerializer. */
export const MAX_PER_LINE = 10;

export type CartLine = { productId: number; quantity: number };

type CartValue = {
  lines: CartLine[];
  /** How many units in total, for the header badge. */
  count: number;
  /** False until localStorage has been read, so the badge does not flash. */
  ready: boolean;
  add: (productId: number, quantity?: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
  quantityOf: (productId: number) => number;
};

const CartContext = createContext<CartValue | null>(null);

function read(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (line): line is CartLine =>
          typeof line?.productId === "number" && typeof line?.quantity === "number",
      )
      .map((line) => ({
        productId: line.productId,
        quantity: Math.min(Math.max(Math.trunc(line.quantity), 1), MAX_PER_LINE),
      }));
  } catch {
    // Corrupt or unreadable storage is not worth an error screen over a basket.
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  // localStorage does not exist during the server render, so the first paint
  // is always an empty basket and the real one arrives on mount. `ready`
  // exists so the header can show nothing rather than a wrong zero.
  useEffect(() => {
    setLines(read());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Private-browsing quota. The basket still works for this page view.
    }
  }, [lines, ready]);

  // Another tab of the same shop should not hold a different basket.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setLines(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const add = useCallback((productId: number, quantity = 1) => {
    setLines((current) => {
      const existing = current.find((line) => line.productId === productId);
      if (!existing) {
        return [...current, { productId, quantity: Math.min(quantity, MAX_PER_LINE) }];
      }
      return current.map((line) =>
        line.productId === productId
          ? { ...line, quantity: Math.min(line.quantity + quantity, MAX_PER_LINE) }
          : line,
      );
    });
  }, []);

  const setQuantity = useCallback((productId: number, quantity: number) => {
    setLines((current) =>
      quantity <= 0
        ? current.filter((line) => line.productId !== productId)
        : current.map((line) =>
            line.productId === productId
              ? { ...line, quantity: Math.min(quantity, MAX_PER_LINE) }
              : line,
          ),
    );
  }, []);

  const remove = useCallback((productId: number) => {
    setLines((current) => current.filter((line) => line.productId !== productId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartValue>(() => {
    const quantityOf = (productId: number) =>
      lines.find((line) => line.productId === productId)?.quantity ?? 0;
    return {
      lines,
      count: lines.reduce((total, line) => total + line.quantity, 0),
      ready,
      add,
      setQuantity,
      remove,
      clear,
      quantityOf,
    };
  }, [lines, ready, add, setQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside <CartProvider>");
  return value;
}

/** Join basket lines to catalogue rows, dropping anything no longer sold. */
export function resolveLines(lines: CartLine[], products: Product[]) {
  const byId = new Map(products.map((product) => [product.id, product]));
  return lines.flatMap((line) => {
    const product = byId.get(line.productId);
    if (!product) return [];
    // Never offer more than is on the shelf; checkout would refuse it anyway.
    const quantity = Math.min(line.quantity, product.stock);
    return [{ product, quantity, requested: line.quantity }];
  });
}
