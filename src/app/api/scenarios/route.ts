import { NextResponse } from "next/server";
import { claudeDeep, hasAnthropicKey } from "@/lib/ai/models";
import { generateStructured } from "@/lib/ai/generate";
import { scenariosSchema } from "@/lib/ai/schemas";
import { buildScenarios, computeBaseline } from "@/lib/logic/scenarios";
import type { PRD, Task, TimelineOption } from "@/types";

export const maxDuration = 60;

const SYSTEM = `You are the Scenario Modelling Agent in an AI Project Orchestrator.
Produce exactly three scenarios: optimistic, base, and pessimistic. Each is
driven by how KEY OUTPUTS land — engineering velocity, scope stability, and a
business metric chain (for example: a 20% price/fee increase causing an ~80%
drop in conversion pushes the business into a pessimistic state). Anchor your
delivery weeks and cost on the provided baseline. Make the pessimistic case
genuinely cautionary and the optimistic case credible, not fantasy.`;

export async function POST(req: Request) {
  const { prd, tasks, option, assignments } = (await req.json()) as {
    prd?: PRD;
    tasks?: Task[];
    option?: TimelineOption;
    assignments?: Record<string, string>;
  };

  if (!prd || !tasks || !option) {
    return NextResponse.json(
      { error: "prd, tasks, option required" },
      { status: 400 },
    );
  }
  const assigns = assignments ?? {};
  const baseline = computeBaseline(tasks, assigns);

  if (hasAnthropicKey()) {
    const ai = await generateStructured({
      model: claudeDeep(),
      schema: scenariosSchema,
      system: SYSTEM,
      prompt:
        `PRD title: ${prd.title}\n` +
        `Success metrics: ${JSON.stringify(prd.successMetrics)}\n` +
        `Timeline: ${option.name} (${option.totalWeeks} weeks)\n` +
        `Computed baseline: deliveryWeeks=${baseline.deliveryWeeks}, ` +
        `totalCostUsd=${baseline.totalCostUsd}\n\n` +
        `Return the three scenarios anchored on this baseline.`,
    });
    if (ai && ai.scenarios?.length === 3) {
      return NextResponse.json({ scenarios: ai.scenarios, source: "claude" });
    }
  }

  return NextResponse.json({
    scenarios: buildScenarios(prd, tasks, option, assigns),
    source: "fallback",
  });
}
