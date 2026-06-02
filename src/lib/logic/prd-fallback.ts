import type { ClarifyingQuestion, PRD } from "@/types";

/**
 * Deterministic PRD scaffold built from a raw idea. Used when no AI key is
 * configured (or the model call fails) so the flow always continues.
 */
export function fallbackPRD(idea: string): {
  prd: PRD;
  questions: ClarifyingQuestion[];
} {
  const clean = idea.trim().replace(/\s+/g, " ");
  const title = toTitle(clean);

  const prd: PRD = {
    title,
    oneLiner: clean.length > 140 ? clean.slice(0, 137) + "..." : clean,
    problemStatement:
      `Today, users lack a streamlined way to achieve this outcome. ` +
      `"${clean}" addresses that gap by delivering a focused, well-scoped ` +
      `experience that can ship incrementally and prove value early.`,
    goals: [
      "Deliver a usable v1 that solves the core user problem",
      "Validate demand with measurable adoption in the first 60 days",
      "Keep the architecture extensible for fast-follow iterations",
    ],
    nonGoals: [
      "Edge-case parity with every competitor feature at launch",
      "Premature optimization before product-market signal",
    ],
    targetUsers: [
      "Primary users who feel the problem most acutely",
      "Internal stakeholders who operate or support the feature",
    ],
    userStories: [
      {
        persona: "a primary user",
        want: "accomplish the core task quickly and reliably",
        soThat: "I get value without friction",
      },
      {
        persona: "an operator",
        want: "monitor usage and intervene when something breaks",
        soThat: "I keep the experience healthy",
      },
    ],
    functionalRequirements: [
      "Core happy-path flow end to end",
      "Input validation and error states",
      "Basic analytics/event instrumentation",
      "Admin or operational visibility",
    ],
    nonFunctionalRequirements: [
      "Responsive performance under expected load",
      "Accessible and localized UI",
      "Secure handling of user data",
    ],
    successMetrics: [
      "Activation rate of the new flow",
      "Task completion / success rate",
      "Retention or repeat-usage signal",
    ],
    assumptions: [
      "Required upstream data/services are available",
      "Scope can ship in phases without a big-bang release",
    ],
    openRisks: [
      "Scope creep beyond the validated core",
      "Dependencies on teams outside this project",
    ],
  };

  const questions: ClarifyingQuestion[] = [
    {
      id: "scope",
      question: "How broad should the v1 scope be?",
      why: "Scope drives timeline, staffing, and risk more than anything else.",
      options: ["Thin slice / MVP", "Balanced v1", "Full-featured launch"],
      recommended: "Balanced v1",
    },
    {
      id: "audience",
      question: "Who is the launch audience?",
      why: "A limited cohort lowers risk; a broad launch raises stakes.",
      options: ["Internal beta", "Limited cohort", "General availability"],
      recommended: "Limited cohort",
    },
    {
      id: "quality",
      question: "What quality bar must v1 hit?",
      why: "Higher bars add QA, review, and compliance work.",
      options: ["Fast experiment", "Production-ready", "Regulated-grade"],
      recommended: "Production-ready",
    },
    {
      id: "platforms",
      question: "Which platforms are in scope first?",
      why: "Each platform adds engineering and QA surface area.",
      options: ["Web only", "Mobile only", "Web + Mobile"],
      recommended: "Web + Mobile",
    },
  ];

  return { prd, questions };
}

function toTitle(s: string): string {
  const words = s.split(" ").slice(0, 8);
  const t = words.join(" ");
  return t.charAt(0).toUpperCase() + t.slice(1);
}
