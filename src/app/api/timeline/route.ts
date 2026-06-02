import { NextResponse } from "next/server";
import { claudeFast, hasAnthropic, type ProvidedKeys } from "@/lib/ai/models";
import { generateStructured } from "@/lib/ai/generate";
import { timelineSchema } from "@/lib/ai/schemas";
import { buildTimelineOptions } from "@/lib/logic/timeline";
import type { ClarifyingQuestion, PRD } from "@/types";

export const maxDuration = 60;

const SYSTEM = `You are the Timeline Agent in an AI Project Orchestrator.
Given a PRD and the user's answers, produce exactly three timeline options:
"recommended" (balanced, the default), "accelerated" (faster, with explicit
drawbacks like skipped QA/reviews and accrued tech debt), and "thorough"
(slower, with extra steps, extra agents, and human-in-the-loop gates).
Be concrete about what is added or skipped and why. recommended must be true
only for the recommended option.`;

export async function POST(req: Request) {
  const { prd, answers, keys, forceFallback } = (await req.json()) as {
    prd?: PRD;
    answers?: Record<string, string>;
    questions?: ClarifyingQuestion[];
    keys?: ProvidedKeys;
    forceFallback?: boolean;
  };

  if (!prd) {
    return NextResponse.json({ error: "prd is required" }, { status: 400 });
  }

  if (!forceFallback && hasAnthropic(keys)) {
    const ai = await generateStructured({
      model: claudeFast(keys),
      schema: timelineSchema,
      system: SYSTEM,
      prompt:
        `PRD:\n${JSON.stringify(prd, null, 2)}\n\n` +
        `User answers:\n${JSON.stringify(answers ?? {}, null, 2)}\n\n` +
        `Return the three timeline options. Use whole numbers of weeks.`,
    });
    if (ai && ai.options?.length === 3) {
      return NextResponse.json({ options: ai.options, source: "claude" });
    }
  }

  return NextResponse.json({
    options: buildTimelineOptions(prd),
    source: "fallback",
  });
}
