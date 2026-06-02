import type { Person, PersonnelGap, Seniority, Task } from "@/types";
import { personnel } from "@/lib/demo-data/personnel-list";

const SENIORITY_RANK: Record<Seniority, number> = {
  Junior: 1,
  Mid: 2,
  Senior: 3,
};

export interface Candidate {
  person: Person;
  score: number;
  reasons: string[];
  meetsSeniority: boolean;
}

/** Rank candidates for a single task by fit. */
export function rankCandidates(task: Task, pool: Person[] = personnel): Candidate[] {
  const sameTeam = pool.filter((p) => p.team === task.team);
  const considered = sameTeam.length > 0 ? sameTeam : pool;

  return considered
    .map((person) => {
      const reasons: string[] = [];

      const overlap = task.requiredSkills.filter((s) =>
        person.skills.some((ps) => ps.toLowerCase().includes(s.toLowerCase())),
      );
      const skillRatio =
        task.requiredSkills.length === 0
          ? 0.5
          : overlap.length / task.requiredSkills.length;
      if (overlap.length) reasons.push(`skills: ${overlap.join(", ")}`);

      const need = SENIORITY_RANK[task.requiredSeniority];
      const have = SENIORITY_RANK[person.seniority];
      const meetsSeniority = have >= need;
      let seniorityFit: number;
      if (have === need) {
        seniorityFit = 1;
        reasons.push("exact seniority match");
      } else if (have > need) {
        seniorityFit = 0.75; // over-qualified: fine but pricier
        reasons.push("over-qualified");
      } else {
        seniorityFit = 0.25; // under-qualified: risky for the gate
        reasons.push("under the required seniority");
      }

      const backlog = person.currentProjects.reduce((s, p) => s + p.load, 0);
      if (backlog > 0.4) reasons.push(`heavy backlog (${Math.round(backlog * 100)}%)`);

      const score =
        skillRatio * 42 +
        seniorityFit * 30 +
        person.availability * 22 -
        backlog * 14;

      return { person, score: round(score), reasons, meetsSeniority };
    })
    .sort((a, b) => b.score - a.score);
}

export interface MatchResult {
  assignments: Record<string, string>; // taskId -> personId
  gaps: PersonnelGap[];
}

/**
 * Greedy assignment across all tasks. Humans are never blocked from covering
 * multiple gates, but over-allocation and seniority shortfalls are recorded
 * as gaps for the feasibility report.
 */
export function assignPersonnel(tasks: Task[]): MatchResult {
  const assignments: Record<string, string> = {};
  const gaps: PersonnelGap[] = [];
  const load: Record<string, number> = {};

  // Assign the most constrained tasks first: HITL + critical.
  const order = [...tasks].sort(
    (a, b) => weight(b) - weight(a) || a.startWeek - b.startWeek,
  );

  for (const task of order) {
    const ranked = rankCandidates(task);
    if (ranked.length === 0) {
      gaps.push(noOneGap(task));
      continue;
    }

    // Prefer candidates that meet seniority and still have headroom.
    const best =
      ranked.find(
        (c) => c.meetsSeniority && (load[c.person.id] ?? 0) < c.person.availability + 0.5,
      ) ??
      ranked.find((c) => c.meetsSeniority) ??
      ranked[0];

    assignments[task.id] = best.person.id;
    load[best.person.id] = (load[best.person.id] ?? 0) + 0.5;

    if (!best.meetsSeniority && (task.isHITL || task.criticality === "critical")) {
      gaps.push({
        role: task.requiredRole,
        seniority: task.requiredSeniority,
        forTask: task.name,
        impact:
          `No ${task.requiredSeniority} ${task.team} reviewer is available, so ` +
          `"${task.name}" would be covered by ${best.person.name} (${best.person.seniority}). ` +
          `This raises decision risk at a critical gate.`,
        suggestedAction: `Borrow or hire a ${task.requiredSeniority} ${task.team} for this gate, or accept the risk explicitly.`,
      });
    } else if ((load[best.person.id] ?? 0) > best.person.availability + 0.5) {
      gaps.push({
        role: task.requiredRole,
        seniority: task.requiredSeniority,
        forTask: task.name,
        impact: `${best.person.name} is over-allocated across overlapping work, which threatens this timeline.`,
        suggestedAction: `Add capacity in ${task.team} or resequence overlapping tasks.`,
      });
    }
  }

  return { assignments, gaps };
}

/**
 * Recompute gaps for an arbitrary assignment map (e.g. one produced by the
 * GPT personnel agent). Mirrors the rules used during greedy assignment.
 */
export function computeGaps(
  tasks: Task[],
  assignments: Record<string, string>,
): PersonnelGap[] {
  const gaps: PersonnelGap[] = [];
  const load: Record<string, number> = {};

  for (const task of tasks) {
    const personId = assignments[task.id];
    const person = personnel.find((p) => p.id === personId);

    if (!person) {
      gaps.push(noOneGap(task));
      continue;
    }

    load[person.id] = (load[person.id] ?? 0) + 0.5;
    const meetsSeniority =
      SENIORITY_RANK[person.seniority] >= SENIORITY_RANK[task.requiredSeniority];

    if (!meetsSeniority && (task.isHITL || task.criticality === "critical")) {
      gaps.push({
        role: task.requiredRole,
        seniority: task.requiredSeniority,
        forTask: task.name,
        impact:
          `No ${task.requiredSeniority} ${task.team} reviewer is available, so ` +
          `"${task.name}" would be covered by ${person.name} (${person.seniority}). ` +
          `This raises decision risk at a critical gate.`,
        suggestedAction: `Borrow or hire a ${task.requiredSeniority} ${task.team} for this gate, or accept the risk explicitly.`,
      });
    } else if (load[person.id] > person.availability + 0.5) {
      gaps.push({
        role: task.requiredRole,
        seniority: task.requiredSeniority,
        forTask: task.name,
        impact: `${person.name} is over-allocated across overlapping work, which threatens this timeline.`,
        suggestedAction: `Add capacity in ${task.team} or resequence overlapping tasks.`,
      });
    }
  }

  return gaps;
}

function weight(t: Task): number {
  const crit = { low: 1, medium: 2, high: 3, critical: 4 }[t.criticality];
  return crit + (t.isHITL ? 4 : 0);
}

function noOneGap(task: Task): PersonnelGap {
  return {
    role: task.requiredRole,
    seniority: task.requiredSeniority,
    forTask: task.name,
    impact: `No one in ${task.team} is available for "${task.name}". This blocks the gate.`,
    suggestedAction: `Staff a ${task.requiredSeniority} ${task.requiredRole}.`,
  };
}

function round(n: number) {
  return Math.round(n * 10) / 10;
}
