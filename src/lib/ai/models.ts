import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

/**
 * Model selection — cost-aware by default.
 *
 * Claude:  prefer Haiku for lighter steps, escalate to Sonnet for the
 *          detail-heavy reasoning steps (PRD, task decomposition, scenarios,
 *          feasibility report).
 * OpenAI:  prefer a mini model for the fast, structured personnel matching.
 *
 * All overridable via env so the demo runs against whatever a given key can
 * access. If a key is missing or a call fails, callers fall back to the
 * deterministic local engines in lib/logic.
 */

export const CLAUDE_DEEP_MODEL =
  process.env.APO_CLAUDE_DEEP_MODEL ?? "claude-sonnet-4-5";
export const CLAUDE_FAST_MODEL =
  process.env.APO_CLAUDE_FAST_MODEL ?? "claude-haiku-4-5";
export const OPENAI_MODEL = process.env.APO_OPENAI_MODEL ?? "gpt-4o-mini";

export function hasAnthropicKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function hasOpenAIKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

/** Sonnet — for detail-heavy reasoning. */
export function claudeDeep(): LanguageModel {
  return anthropic(CLAUDE_DEEP_MODEL);
}

/** Haiku — for lighter, faster steps. */
export function claudeFast(): LanguageModel {
  return anthropic(CLAUDE_FAST_MODEL);
}

/** Mini OpenAI model — fast structured matching. */
export function gpt(): LanguageModel {
  return openai(OPENAI_MODEL);
}
