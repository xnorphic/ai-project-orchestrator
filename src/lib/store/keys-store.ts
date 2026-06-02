"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface KeysStore {
  anthropic: string;
  openai: string;
  setAnthropic: (v: string) => void;
  setOpenai: (v: string) => void;
  clear: () => void;
}

/**
 * User-provided API keys, kept in localStorage on the user's own device and
 * sent only to this app's own agent routes (same origin). No key ever leaves
 * for a third party except the AI provider the user chose.
 */
export const useKeys = create<KeysStore>()(
  persist(
    (set) => ({
      anthropic: "",
      openai: "",
      setAnthropic: (anthropic) => set({ anthropic: anthropic.trim() }),
      setOpenai: (openai) => set({ openai: openai.trim() }),
      clear: () => set({ anthropic: "", openai: "" }),
    }),
    { name: "apo-keys" },
  ),
);

export interface ProvidedKeys {
  anthropic?: string;
  openai?: string;
}

export function currentKeys(): ProvidedKeys {
  const { anthropic, openai } = useKeys.getState();
  return { anthropic, openai };
}
