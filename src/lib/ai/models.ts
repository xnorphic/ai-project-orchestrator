import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

/**
 * Model selection — cost-aware, with bring-your-own-key support.
 *
 * Keys are resolved per request: a key passed from the client (entered in the
 * in-app settings) takes priority, otherwise the server env var is used. If
 * neither exists, callers fall back to the deterministic engines in lib/logic.
 *
 * Claude:  Haiku for lighter steps, Sonnet for detail-heavy reasoning
 *          (PRD, task decomposition, scenarios, feasibility report).
 * OpenAI:  a mini model for the fast, structured personnel matching.
 */

// Defaults favour Haiku so live calls finish inside Vercel's serverless
// function timeout (Sonnet on a large schema can run 60-90s and 504s on the
// Hobby plan). Set APO_CLAUDE_DEEP_MODEL=claude-sonnet-4-5 locally or on a plan
// with a higher function limit if you want Sonnet's depth.
export const CLAUDE_DEEP_MODEL =
  process.env.APO_CLAUDE_DEEP_MODEL ?? "claude-haiku-4-5";
export const CLAUDE_FAST_MODEL =
  process.env.APO_CLAUDE_FAST_MODEL ?? "claude-haiku-4-5";
export const OPENAI_MODEL = process.env.APO_OPENAI_MODEL ?? "gpt-4o-mini";

export interface ProvidedKeys {
  anthropic?: string;
  openai?: string;
}

function anthropicKey(keys?: ProvidedKeys): string {
  return (keys?.anthropic?.trim() || process.env.ANTHROPIC_API_KEY || "").trim();
}

function openaiKey(keys?: ProvidedKeys): string {
  return (keys?.openai?.trim() || process.env.OPENAI_API_KEY || "").trim();
}

export function hasAnthropic(keys?: ProvidedKeys): boolean {
  return Boolean(anthropicKey(keys));
}

export function hasOpenAI(keys?: ProvidedKeys): boolean {
  return Boolean(openaiKey(keys));
}

/** Sonnet — for detail-heavy reasoning. */
export function claudeDeep(keys?: ProvidedKeys): LanguageModel {
  return createAnthropic({ apiKey: anthropicKey(keys) })(CLAUDE_DEEP_MODEL);
}

/** Haiku — for lighter, faster steps. */
export function claudeFast(keys?: ProvidedKeys): LanguageModel {
  return createAnthropic({ apiKey: anthropicKey(keys) })(CLAUDE_FAST_MODEL);
}

/** Mini OpenAI model — fast structured matching. */
export function gpt(keys?: ProvidedKeys): LanguageModel {
  return createOpenAI({ apiKey: openaiKey(keys) })(OPENAI_MODEL);
}
