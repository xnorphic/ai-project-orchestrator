"use client";

import { create } from "zustand";

interface UiStore {
  keysOpen: boolean;
  openKeys: () => void;
  closeKeys: () => void;
}

export const useUi = create<UiStore>((set) => ({
  keysOpen: false,
  openKeys: () => set({ keysOpen: true }),
  closeKeys: () => set({ keysOpen: false }),
}));
