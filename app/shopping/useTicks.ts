"use client";

import { useCallback, useSyncExternalStore } from "react";

// Shopping-list ticks, remembered in this browser only (localStorage). Nothing goes to the database.
const KEY = "pantry-shopping-ticks";
const EVENT = "pantry-ticks-changed";

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]"; // private mode or blocked storage: just don't remember
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

export function useTicks() {
  const raw = useSyncExternalStore(subscribe, read, () => "[]");
  const ticked = new Set<string>(JSON.parse(raw));

  const toggle = useCallback((key: string) => {
    const next = new Set<string>(JSON.parse(read()));
    if (next.has(key)) next.delete(key);
    else next.add(key);
    try {
      localStorage.setItem(KEY, JSON.stringify([...next]));
    } catch {
      /* storage unavailable: the tick just won't stick */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { ticked, toggle };
}
