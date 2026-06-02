import type { PRD, TimelineOption } from "@/types";

/**
 * Build the three timeline options from PRD complexity. Doubles as the
 * deterministic fallback for the timeline agent.
 */
export function buildTimelineOptions(prd: PRD): TimelineOption[] {
  const complexity =
    prd.functionalRequirements.length +
    prd.nonFunctionalRequirements.length +
    Math.ceil(prd.goals.length / 2);

  // Recommended baseline scales with complexity, clamped to a sane range.
  const baseWeeks = clamp(8 + complexity, 8, 20);
  const acceleratedWeeks = Math.max(5, Math.round(baseWeeks * 0.65));
  const thoroughWeeks = Math.round(baseWeeks * 1.35);

  return [
    {
      id: "recommended",
      name: "Recommended",
      tagline: "Balanced pace with real QA and review gates.",
      totalWeeks: baseWeeks,
      sprintLengthWeeks: 2,
      recommended: true,
      advantages: [
        "Two-week sprints with predictable cadence",
        "Full QA pass plus staged rollout",
        "Code review and design sign-off at key gates",
        "Room to absorb normal slippage",
      ],
      drawbacks: [
        "Not the fastest path to market",
        "Requires steady cross-functional staffing",
      ],
      extraSteps: ["Staging soak", "Design sign-off"],
      skippedSteps: [],
      extraAgents: [],
      hitlGates: 4,
    },
    {
      id: "accelerated",
      name: "Accelerated",
      tagline: "Ship fast — trade depth for speed.",
      totalWeeks: acceleratedWeeks,
      sprintLengthWeeks: 1,
      recommended: false,
      advantages: [
        `~${baseWeeks - acceleratedWeeks} weeks faster to launch`,
        "One-week sprints keep momentum high",
        "Lower upfront cost",
      ],
      drawbacks: [
        "QA reduced to smoke tests — regression gaps likely",
        "No formal design sign-off; UX polish deferred",
        "Load and security testing skipped pre-launch",
        "Tech debt accrues and is flagged for a fast-follow",
        "Fewer human review gates increases defect risk",
      ],
      extraSteps: [],
      skippedSteps: [
        "Full regression QA",
        "Load testing",
        "Security audit",
        "Design sign-off gate",
      ],
      extraAgents: [],
      hitlGates: 2,
    },
    {
      id: "thorough",
      name: "Thorough",
      tagline: "Maximize quality, compliance, and confidence.",
      totalWeeks: thoroughWeeks,
      sprintLengthWeeks: 2,
      recommended: false,
      advantages: [
        "Human-in-the-loop approval at every critical juncture",
        "Dedicated security and compliance review",
        "Full regression + load testing",
        "Documentation and runbooks produced alongside build",
        "Lowest post-launch risk",
      ],
      drawbacks: [
        `~${thoroughWeeks - baseWeeks} weeks slower than recommended`,
        "Highest cost and staffing demand",
        "More coordination overhead across gates",
      ],
      extraSteps: [
        "Security audit",
        "Compliance review",
        "Load & resilience testing",
        "Documentation pass",
        "Executive go/no-go gate",
      ],
      skippedSteps: [],
      extraAgents: [
        "Compliance Review Agent",
        "Security Audit Agent",
        "Documentation Agent",
      ],
      hitlGates: 7,
    },
  ];
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
