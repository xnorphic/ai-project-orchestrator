import { NextResponse } from "next/server";
import { claudeDeep, hasAnthropic, type ProvidedKeys } from "@/lib/ai/models";
import { generateStructured } from "@/lib/ai/generate";
import { reportSchema } from "@/lib/ai/schemas";
import { buildReport } from "@/lib/logic/report";
import { computeGaps } from "@/lib/logic/matching";
import type {
  PRD,
  Scenario,
  Task,
  TimelineOption,
} from "@/types";

export const maxDuration = 60;

const SYSTEM = `You are the Feasibility Report Agent in an AI Project Orchestrator.
Summarize feasibility, the expected outcome, key outcomes, and delivery risks
across four categories: cost, team, timeline, and tech backlog (techdebt).
Each risk has a severity (1-5) and likelihood (1-5). Be direct and specific
with numbers. Recommendations should be actionable.`;

export async function POST(req: Request) {
  const { prd, tasks, option, assignments, scenarios, keys } =
    (await req.json()) as {
      prd?: PRD;
      tasks?: Task[];
      option?: TimelineOption;
      assignments?: Record<string, string>;
      scenarios?: Scenario[];
      keys?: ProvidedKeys;
    };

  if (!prd || !tasks || !option) {
    return NextResponse.json(
      { error: "prd, tasks, option required" },
      { status: 400 },
    );
  }

  const assigns = assignments ?? {};
  // Truthful, computed gaps from the actual assignment.
  const realGaps = computeGaps(tasks, assigns);
  const deterministic = buildReport(
    prd,
    tasks,
    option,
    assigns,
    realGaps,
    scenarios ?? [],
  );

  if (hasAnthropic(keys)) {
    const ai = await generateStructured({
      model: claudeDeep(keys),
      schema: reportSchema,
      system: SYSTEM,
      prompt:
        `PRD title: ${prd.title}\n` +
        `Timeline: ${option.name}\n` +
        `Computed feasibility score: ${deterministic.feasibilityScore}\n` +
        `Staffing gaps (authoritative): ${JSON.stringify(realGaps)}\n` +
        `Scenarios: ${JSON.stringify(scenarios ?? [])}\n\n` +
        `Write the report. Keep it grounded in this data.`,
    });
    if (ai) {
      // Keep AI narrative, but force truthful staffing gaps.
      return NextResponse.json({
        report: { ...ai, gaps: realGaps },
        source: "claude",
      });
    }
  }

  return NextResponse.json({ report: deterministic, source: "fallback" });
}
