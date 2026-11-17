"use client";

import { useCallback, useSyncExternalStore } from "react";

export type CartLine = { id: string; qty: number };

export const MAX_QTY = 20;
const KEY = "cafe-delight-cart";
const EMPTY: CartLine[] = [];
const listeners = new Set<() => void>();
let rawCache: string | null = null;
let cache: CartLine[] = EMPTY;

// Reads the cart from localStorage; returns the same array until the stored text changes.
function read(): CartLine[] {
  const raw = window.localStorage.getItem(KEY);
  if (raw !== rawCache) {
    rawCache = raw;
    try {
      const data: unknown = raw ? JSON.parse(raw) : [];
      cache = Array.isArray(data)
        ? data.filter((l): l is CartLine => typeof l?.id === "string" && Number.isInteger(l?.qty) && l.qty > 0 && l.qty <= MAX_QTY)
        : EMPTY;
    } catch {
      cache = EMPTY;
    }
  }
  return cache;
}

function write(next: CartLine[]) {
  window.localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb); // keeps other open tabs in sync
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

const noop = () => () => {};

export function useCart() {
  // The server snapshot is an empty cart, so server and first client render always match.
  const lines = useSyncExternalStore(subscribe, read, () => EMPTY);
  const ready = useSyncExternalStore(noop, () => true, () => false);

  const add = useCallback((id: string) => {
    const cur = read();
    write(cur.some((l) => l.id === id) ? cur.map((l) => (l.id === id ? { ...l, qty: Math.min(l.qty + 1, MAX_QTY) } : l)) : [...cur, { id, qty: 1 }]);
  }, []);
  const setQty = useCallback((id: string, qty: number) => {
    write(read().map((l) => (l.id === id ? { ...l, qty: Math.max(1, Math.min(qty, MAX_QTY)) } : l)));
  }, []);
  const remove = useCallback((id: string) => write(read().filter((l) => l.id !== id)), []);
  const clear = useCallback(() => write([]), []);

  const count = lines.reduce((n, l) => n + l.qty, 0);
  return { lines, count, ready, add, setQty, remove, clear };
}
