"use client";

import { useEffect, useState } from "react";

/** True after the first client mount — used to gate localStorage-backed state. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
