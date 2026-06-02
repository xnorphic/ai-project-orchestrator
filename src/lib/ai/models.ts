import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

/**
 * Model selection.
 *
 * Claude handles long-form reasoning (PRD, tasks, scenarios, report).
 * GPT handles the fast, structured personnel-matching step.
 *
 * Both are overridable via env so the demo runs against whatever models a
 * given API key has access to. If a key is missing or a call fails, callers
 * fall back to deterministic local generators (see lib/fallback).
 */

export const CLAUDE_MODEL = process.env.APO_CLAUDE_MODEL ?? "claude-sonnet-4-5";
export const OPENAI_MODEL = process.env.APO_OPENAI_MODEL ?? "gpt-4o";

export function hasAnthropicKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function hasOpenAIKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function claude(): LanguageModel {
  return anthropic(CLAUDE_MODEL);
}

export function gpt(): LanguageModel {
  return openai(OPENAI_MODEL);
}
