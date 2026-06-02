import { currentKeys } from "@/lib/store/keys-store";
import { toast } from "@/lib/store/toast-store";

/** Abort a slow live call before Vercel's function limit kicks in. */
const LIVE_TIMEOUT_MS = 55_000;

/** Show the "running without keys" notice at most once per session. */
let noKeyNoticeShown = false;

async function rawPost<T>(
  path: string,
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, keys: currentKeys() }),
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${path} failed (${res.status}). ${text}`.trim());
  }
  return res.json() as Promise<T>;
}

/**
 * POST to an agent route, injecting the user's API keys from the keys store.
 *
 * Resilience: if a live AI call errors or runs past the serverless timeout, we
 * automatically retry the same route in `forceFallback` mode so the user always
 * gets a result — and surface a top-right toast explaining what happened.
 */
export async function postAgent<T = unknown>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const keys = currentKeys();
  const hasKeys = Boolean(keys.anthropic || keys.openai);

  // No keys at all → the route returns the deterministic engine directly.
  if (!hasKeys) {
    if (!noKeyNoticeShown) {
      noKeyNoticeShown = true;
      toast({
        tone: "info",
        title: "Running in fallback mode",
        message:
          "Results use the built-in engine. Add your API keys to run the live AI agents.",
        keysAction: true,
        duration: 9000,
      });
    }
    return rawPost<T>(path, body);
  }

  // Keys present → try the live call with a timeout, then degrade gracefully.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LIVE_TIMEOUT_MS);
  try {
    const data = await rawPost<T>(path, body, controller.signal);
    // The route succeeded but silently fell back (bad/blocked key, etc.).
    if ((data as { source?: string })?.source === "fallback") {
      toast({
        tone: "warning",
        title: "Used the fallback engine",
        message:
          "Your API key didn't return a usable result. Check the key, or keep going with the built-in engine.",
        keysAction: true,
        duration: 0,
      });
    }
    return data;
  } catch {
    // Timeout or a server error (e.g. 504). Retry instantly in fallback mode.
    const data = await rawPost<T>(path, { ...body, forceFallback: true });
    toast({
      tone: "warning",
      title: "Live AI timed out — used fallback",
      message:
        "The AI call didn't finish in time. We generated this step with the built-in engine. Update your API keys to retry live AI.",
      keysAction: true,
      duration: 0,
    });
    return data;
  } finally {
    clearTimeout(timer);
  }
}
