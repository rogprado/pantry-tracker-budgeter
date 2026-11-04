"use client";

import { Check, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// A small "Updated" confirmation at the bottom of the screen, with an optional Undo.
// Anything can show one with showToast(); it replaces the previous toast.

type Toast = { id: number; message: string; undo?: () => Promise<boolean> };
const EVENT = "pantry:toast";

export function showToast(message: string, undo?: () => Promise<boolean>) {
  window.dispatchEvent(new CustomEvent<Toast>(EVENT, { detail: { id: Date.now(), message, undo } }));
}

export default function Toaster() {
  const [toast, setToast] = useState<Toast | null>(null);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onToast = (e: Event) => {
      const next = (e as CustomEvent<Toast>).detail;
      setToast(next);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast((t) => (t?.id === next.id ? null : t)), 7000);
    };
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);

  if (!toast) return null;

  async function undo() {
    if (!toast?.undo) return;
    setBusy(true);
    const ok = await toast.undo();
    setBusy(false);
    showToast(ok ? "Undone. Back to how it was." : "Couldn't undo that. Please edit the item instead.");
  }

  return (
    <div role="status" aria-live="polite" className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div className="flex items-center gap-4 rounded-lg bg-eggplant px-4 py-3 text-[15px] text-white shadow-lift">
        <Check size={18} className="shrink-0 text-fresh-soft" aria-hidden="true" />
        <span>{toast.message}</span>
        {toast.undo && (
          <button
            type="button"
            onClick={undo}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 font-semibold text-white underline-offset-4 hover:underline disabled:opacity-60"
          >
            <Undo2 size={16} aria-hidden="true" />
            {busy ? "Undoing…" : "Undo"}
          </button>
        )}
      </div>
    </div>
  );
}
