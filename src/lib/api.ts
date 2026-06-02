import { currentKeys } from "@/lib/store/keys-store";

/**
 * POST to an agent route, injecting the user's API keys from the keys store.
 * Keys go only to our own same-origin route, which uses them to call the
 * chosen AI provider (or falls back to the deterministic engine).
 */
export async function postAgent<T = unknown>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, keys: currentKeys() }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${path} failed (${res.status}). ${text}`.trim());
  }
  return res.json() as Promise<T>;
}
