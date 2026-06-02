import { NextResponse } from "next/server";
import { claude, hasAnthropicKey } from "@/lib/ai/models";
import { generateStructured } from "@/lib/ai/generate";
import { tasksSchema } from "@/lib/ai/schemas";
import { buildTasks } from "@/lib/logic/tasks";
import type { PRD, Task, TimelineOption } from "@/types";

export const maxDuration = 60;

const SYSTEM = `You are the Task Decomposition Agent in an AI Project Orchestrator.
Break the PRD into a scheduled set of tasks for the chosen timeline. Cover the
full lifecycle (discovery, design, architecture, build, QA, security/compliance
where relevant, release, GTM). Each task names the AI sub-agent that drives it
and the human role/seniority that owns it. Mark every CRITICAL juncture as a
human-in-the-loop gate (isHITL true) with a short hitlReason and assign it the
correct senior role. Schedule with startWeek (0-indexed) and durationWeeks,
using dependsOn (task ids) to express ordering. Keep total span close to the
timeline's total weeks; allow parallel work via overlapping weeks.`;

function normalize(tasks: Task[]): Task[] {
  return tasks
    .filter((t) => t && t.id && t.name)
    .map((t) => ({
      ...t,
      startWeek: Math.max(0, Math.round(t.startWeek ?? 0)),
      durationWeeks: Math.max(1, Math.round(t.durationWeeks ?? 1)),
      dependsOn: Array.isArray(t.dependsOn) ? t.dependsOn : [],
      requiredSkills: Array.isArray(t.requiredSkills) ? t.requiredSkills : [],
      isHITL: Boolean(t.isHITL),
      assignedPersonId: null,
    }));
}

export async function POST(req: Request) {
  const { prd, option } = (await req.json()) as {
    prd?: PRD;
    option?: TimelineOption;
  };

  if (!prd || !option) {
    return NextResponse.json(
      { error: "prd and option are required" },
      { status: 400 },
    );
  }

  if (hasAnthropicKey()) {
    const ai = await generateStructured({
      model: claude(),
      schema: tasksSchema,
      system: SYSTEM,
      prompt:
        `PRD:\n${JSON.stringify(prd, null, 2)}\n\n` +
        `Chosen timeline:\n${JSON.stringify(option, null, 2)}\n\n` +
        `Return the task list.`,
    });
    if (ai && ai.tasks?.length >= 6) {
      return NextResponse.json({
        tasks: normalize(ai.tasks as Task[]),
        source: "claude",
      });
    }
  }

  return NextResponse.json({
    tasks: buildTasks(prd, option),
    source: "fallback",
  });
}
