import { NextResponse } from "next/server";
import { z } from "zod";
import { gpt, hasOpenAIKey } from "@/lib/ai/models";
import { generateStructured } from "@/lib/ai/generate";
import { assignPersonnel, computeGaps } from "@/lib/logic/matching";
import { personnel } from "@/lib/demo-data/personnel-list";
import type { Task } from "@/types";

export const maxDuration = 60;

const SYSTEM = `You are the Personnel Matching Agent in an AI Project Orchestrator.
Assign exactly one person from the provided roster to each task. Match on team,
required seniority, and skills. For human-in-the-loop / critical gates, prefer
the right senior reviewer even if busy. Balance load — avoid over-loading one
person across overlapping tasks. Only use personId values from the roster.`;

const assignmentSchema = z.object({
  assignments: z.array(
    z.object({
      taskId: z.string(),
      personId: z.string(),
      rationale: z.string(),
    }),
  ),
});

export async function POST(req: Request) {
  const { tasks } = (await req.json()) as { tasks?: Task[] };

  if (!tasks || tasks.length === 0) {
    return NextResponse.json({ error: "tasks are required" }, { status: 400 });
  }

  // Deterministic baseline — always available.
  const baseline = assignPersonnel(tasks);

  if (hasOpenAIKey()) {
    const roster = personnel.map((p) => ({
      id: p.id,
      name: p.name,
      team: p.team,
      seniority: p.seniority,
      skills: p.skills,
      availability: p.availability,
      backlog: p.currentProjects,
    }));
    const taskBrief = tasks.map((t) => ({
      id: t.id,
      name: t.name,
      team: t.team,
      requiredSeniority: t.requiredSeniority,
      requiredSkills: t.requiredSkills,
      isHITL: t.isHITL,
      criticality: t.criticality,
      startWeek: t.startWeek,
      durationWeeks: t.durationWeeks,
    }));

    const ai = await generateStructured({
      model: gpt(),
      schema: assignmentSchema,
      system: SYSTEM,
      prompt:
        `Roster:\n${JSON.stringify(roster, null, 2)}\n\n` +
        `Tasks:\n${JSON.stringify(taskBrief, null, 2)}\n\n` +
        `Assign one valid personId to every taskId.`,
    });

    if (ai?.assignments?.length) {
      const validIds = new Set(personnel.map((p) => p.id));
      const merged: Record<string, string> = { ...baseline.assignments };
      const rationales: Record<string, string> = {};
      for (const a of ai.assignments) {
        if (validIds.has(a.personId) && tasks.some((t) => t.id === a.taskId)) {
          merged[a.taskId] = a.personId;
          rationales[a.taskId] = a.rationale;
        }
      }
      return NextResponse.json({
        assignments: merged,
        gaps: computeGaps(tasks, merged),
        rationales,
        source: "gpt",
      });
    }
  }

  return NextResponse.json({
    assignments: baseline.assignments,
    gaps: baseline.gaps,
    rationales: {},
    source: "fallback",
  });
}
