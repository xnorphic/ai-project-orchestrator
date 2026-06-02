"use client";

import { create } from "zustand";

export type ToastTone = "info" | "warning" | "error" | "success";

export interface Toast {
  id: string;
  tone: ToastTone;
  title: string;
  message?: string;
  /** Show an "Update API keys" action that opens the key modal. */
  keysAction?: boolean;
  /** Auto-dismiss after this many ms (0 = sticky). */
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => string;
  dismiss: (id: string) => void;
}

export const useToasts = create<ToastStore>((set) => ({
  toasts: [],
  push: (t) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, ...t }] }));
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

/** Convenience helper usable outside React (e.g. in the fetch wrapper). */
export function toast(t: Omit<Toast, "id">): string {
  return useToasts.getState().push(t);
}
