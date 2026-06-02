import type { PRD, Scenario, Task, TimelineOption } from "@/types";
import { personById } from "@/lib/demo-data/personnel-list";

const FALLBACK_RATE = { Junior: 1800, Mid: 3400, Senior: 5200 };

export interface BaselineMetrics {
  deliveryWeeks: number;
  totalCostUsd: number;
}

export function computeBaseline(
  tasks: Task[],
  assignments: Record<string, string>,
): BaselineMetrics {
  const deliveryWeeks = tasks.reduce(
    (max, t) => Math.max(max, t.startWeek + t.durationWeeks),
    0,
  );

  const totalCostUsd = tasks.reduce((sum, t) => {
    const person = personById(assignments[t.id] ?? t.assignedPersonId);
    const rate = person?.weeklyCost ?? FALLBACK_RATE[t.requiredSeniority];
    return sum + rate * t.durationWeeks;
  }, 0);

  return { deliveryWeeks, totalCostUsd };
}

/**
 * Build base / optimistic / pessimistic scenarios. Each is driven by how the
 * key outputs land (velocity, scope, and a business metric chain), per the
 * "pricing +20% -> CTR -80%" style of reasoning.
 *
 * Doubles as the deterministic fallback for the scenario agent.
 */
export function buildScenarios(
  prd: PRD,
  tasks: Task[],
  option: TimelineOption,
  assignments: Record<string, string>,
): Scenario[] {
  const base = computeBaseline(tasks, assignments);
  const primaryKpi = prd.successMetrics[0] ?? "the primary adoption KPI";

  return [
    {
      id: "optimistic",
      name: "Optimistic",
      narrative:
        "Teams hit full velocity, scope holds, and pricing stays neutral so " +
        "conversion is steady. Adoption beats target and the launch compounds.",
      drivers: [
        {
          metric: "Engineering velocity",
          assumption: "100% of planned points delivered",
          effect: "delivery pulls in ~15%",
        },
        {
          metric: "Scope stability",
          assumption: "no creep beyond the validated core",
          effect: "feature completeness reaches 100%",
        },
        {
          metric: "Pricing vs. conversion",
          assumption: "fees held flat",
          effect: `${primaryKpi} beats plan; CTR steady`,
        },
      ],
      outcomes: {
        deliveryWeeks: Math.max(4, Math.round(base.deliveryWeeks * 0.85)),
        totalCostUsd: Math.round(base.totalCostUsd * 0.92),
        featureCompleteness: 100,
        teamUtilization: 86,
        confidence: 84,
        riskLevel: "Low",
      },
    },
    {
      id: "base",
      name: "Base",
      narrative:
        "The expected case: minor slippage absorbed by buffer, small scope " +
        "creep, and adoption landing near target. The plan holds.",
      drivers: [
        {
          metric: "Engineering velocity",
          assumption: "~85% of planned points delivered",
          effect: "on-time delivery within buffer",
        },
        {
          metric: "Scope stability",
          assumption: "minor creep absorbed",
          effect: "feature completeness ~85%",
        },
        {
          metric: "Pricing vs. conversion",
          assumption: "modest fee with promo offset",
          effect: `${primaryKpi} lands near target`,
        },
      ],
      outcomes: {
        deliveryWeeks: base.deliveryWeeks,
        totalCostUsd: base.totalCostUsd,
        featureCompleteness: option.id === "accelerated" ? 78 : 88,
        teamUtilization: 76,
        confidence: 70,
        riskLevel: "Moderate",
      },
    },
    {
      id: "pessimistic",
      name: "Pessimistic",
      narrative:
        "Velocity drops, scope creeps, and a key dependency slips. Critically, " +
        "a 20% fee increase cuts conversion by ~80% (CTR collapse), forcing a " +
        "re-scope and a softer launch. The business slides into recovery mode.",
      drivers: [
        {
          metric: "Engineering velocity",
          assumption: "~60% of planned points; rework from skipped reviews",
          effect: "delivery slips ~40%",
        },
        {
          metric: "Scope creep",
          assumption: "+30% unplanned scope",
          effect: "completeness drops and cost rises",
        },
        {
          metric: "Pricing vs. conversion",
          assumption: "fee +20%",
          effect: "CTR / conversion -80%; KPI badly missed",
        },
        {
          metric: "Dependencies",
          assumption: "partner/regulatory slip",
          effect: "launch window pushed",
        },
      ],
      outcomes: {
        deliveryWeeks: Math.round(base.deliveryWeeks * 1.4),
        totalCostUsd: Math.round(base.totalCostUsd * 1.35),
        featureCompleteness: option.id === "accelerated" ? 55 : 64,
        teamUtilization: 96,
        confidence: 44,
        riskLevel: "High",
      },
    },
  ];
}
