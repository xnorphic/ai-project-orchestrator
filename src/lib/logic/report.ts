import type {
  FeasibilityReport,
  PersonnelGap,
  PRD,
  ReportRisk,
  Scenario,
  Task,
  TimelineOption,
} from "@/types";
import { computeBaseline } from "@/lib/logic/scenarios";
import { personById } from "@/lib/demo-data/personnel-list";

const fmtUsd = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;

/**
 * Build the feasibility / risk report. Doubles as the deterministic fallback
 * for the report agent. Captures the required summary of feasibility, outcome,
 * key outcomes, and delivery risks (cost, team, timeline, tech backlog).
 */
export function buildReport(
  prd: PRD,
  tasks: Task[],
  option: TimelineOption,
  assignments: Record<string, string>,
  gaps: PersonnelGap[],
  scenarios: Scenario[],
): FeasibilityReport {
  const base = computeBaseline(tasks, assignments);
  const hitlCount = tasks.filter((t) => t.isHITL).length;
  const criticalGaps = gaps.filter(
    (g) => g.seniority === "Senior" || g.impact.toLowerCase().includes("block"),
  );

  // Feasibility score.
  let score = 100;
  score -= gaps.length * 6;
  score -= criticalGaps.length * 6;
  if (option.id === "accelerated") score -= 12;
  if (option.id === "thorough") score += 4;
  const overAllocated = countOverAllocated(tasks, assignments);
  score -= overAllocated * 4;
  score = Math.max(8, Math.min(98, Math.round(score)));

  const verdict =
    score >= 75
      ? "Feasible as planned"
      : score >= 55
        ? "Feasible with mitigations"
        : score >= 35
          ? "Feasible only with added capacity"
          : "High risk — re-scope or re-staff";

  const baseScn = scenarios.find((s) => s.id === "base");

  const risks: ReportRisk[] = [];

  // Team / staffing risk
  if (gaps.length > 0) {
    risks.push({
      category: "team",
      title: `${gaps.length} staffing gap${gaps.length > 1 ? "s" : ""} at critical gates`,
      description:
        "Required seniority or capacity is missing for one or more human-in-the-loop checkpoints. " +
        "Gates may be covered by under-qualified or over-allocated staff.",
      severity: criticalGaps.length > 0 ? 5 : 3,
      likelihood: 4,
      mitigation: "Borrow or hire for the flagged gates, or formally accept the risk.",
    });
  }

  // Timeline risk
  risks.push({
    category: "timeline",
    title:
      option.id === "accelerated"
        ? "Compressed timeline leaves no buffer"
        : "Schedule slip under load",
    description:
      option.id === "accelerated"
        ? "Smoke-only QA and skipped reviews mean defects surface late, risking rework after launch."
        : `Critical path runs ~${base.deliveryWeeks} weeks; overlapping work raises slip risk if velocity dips.`,
    severity: option.id === "accelerated" ? 4 : 3,
    likelihood: option.id === "accelerated" ? 4 : 3,
    mitigation:
      option.id === "accelerated"
        ? "Add a regression pass before broad rollout; stage the launch."
        : "Protect buffer; resequence overlapping engineering tasks if velocity drops.",
  });

  // Cost risk
  risks.push({
    category: "cost",
    title: "Cost overrun in the pessimistic case",
    description:
      `Baseline cost is ${fmtUsd(base.totalCostUsd)}. Scope creep and slower velocity ` +
      `push it toward ${fmtUsd(Math.round(base.totalCostUsd * 1.35))} in the pessimistic scenario.`,
    severity: 3,
    likelihood: 3,
    mitigation: "Gate scope changes through the PRD owner; track burn weekly.",
  });

  // Tech debt risk
  if (option.id === "accelerated") {
    risks.push({
      category: "techdebt",
      title: "Tech debt deferred to fast-follow",
      description:
        "Skipped design sign-off, security audit, and load testing accrue debt that must be repaid post-launch.",
      severity: 4,
      likelihood: 5,
      mitigation: "Book a hardening sprint immediately after launch.",
    });
  } else {
    risks.push({
      category: "techdebt",
      title: "Integration debt at hand-off points",
      description:
        "Overlapping backend/frontend work can leave seams that need cleanup before scaling.",
      severity: 2,
      likelihood: 3,
      mitigation: "Reserve integration-hardening time on the critical path.",
    });
  }

  const keyOutcomes = [
    `Delivery in ~${base.deliveryWeeks} weeks on the ${option.name.toLowerCase()} plan`,
    `Baseline cost ~${fmtUsd(base.totalCostUsd)} across ${tasks.length} tasks`,
    `${hitlCount} human-in-the-loop gates protecting critical decisions`,
    baseScn
      ? `Base case: ${baseScn.outcomes.featureCompleteness}% complete at ${baseScn.outcomes.confidence}% confidence`
      : "Three scenarios modelled across velocity, scope, and pricing",
  ];

  const recommendations: string[] = [];
  if (criticalGaps.length > 0) {
    recommendations.push(
      `Close ${criticalGaps.length} senior staffing gap${criticalGaps.length > 1 ? "s" : ""} before the affected gates.`,
    );
  }
  if (option.id === "accelerated") {
    recommendations.push(
      "Treat this as an experiment: stage the rollout and plan a hardening sprint.",
    );
  } else {
    recommendations.push("Proceed with the recommended plan; protect the buffer.");
  }
  recommendations.push(
    "Re-run scenarios after the architecture gate when estimates firm up.",
  );

  const executiveSummary =
    `"${prd.title}" is ${verdict.toLowerCase()} on the ${option.name.toLowerCase()} plan, ` +
    `delivering in roughly ${base.deliveryWeeks} weeks for about ${fmtUsd(base.totalCostUsd)}. ` +
    `${hitlCount} human-in-the-loop gates guard the critical decisions. ` +
    (gaps.length > 0
      ? `${gaps.length} staffing gap${gaps.length > 1 ? "s" : ""} need attention — see below.`
      : "Current staffing covers every gate.");

  return {
    executiveSummary,
    feasibilityScore: score,
    verdict,
    keyOutcomes,
    risks,
    gaps,
    recommendations,
  };
}

function countOverAllocated(
  tasks: Task[],
  assignments: Record<string, string>,
): number {
  const load: Record<string, number> = {};
  for (const t of tasks) {
    const id = assignments[t.id] ?? t.assignedPersonId;
    if (id) load[id] = (load[id] ?? 0) + 0.5;
  }
  let count = 0;
  for (const [id, l] of Object.entries(load)) {
    const p = personById(id);
    if (p && l > p.availability + 0.5) count++;
  }
  return count;
}
