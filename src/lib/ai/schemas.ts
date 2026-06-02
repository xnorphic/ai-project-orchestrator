import { z } from "zod";

const team = z.enum([
  "Product",
  "Engineering",
  "DevOps",
  "QA",
  "Business",
  "Design",
]);
const seniority = z.enum(["Junior", "Mid", "Senior"]);
const criticality = z.enum(["low", "medium", "high", "critical"]);

export const prdSchema = z.object({
  prd: z.object({
    title: z.string(),
    oneLiner: z.string(),
    problemStatement: z.string(),
    goals: z.array(z.string()),
    nonGoals: z.array(z.string()),
    targetUsers: z.array(z.string()),
    userStories: z.array(
      z.object({
        persona: z.string(),
        want: z.string(),
        soThat: z.string(),
      }),
    ),
    functionalRequirements: z.array(z.string()),
    nonFunctionalRequirements: z.array(z.string()),
    successMetrics: z.array(z.string()),
    assumptions: z.array(z.string()),
    openRisks: z.array(z.string()),
  }),
  questions: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      why: z.string(),
      options: z.array(z.string()),
      recommended: z.string(),
    }),
  ),
});

export const timelineSchema = z.object({
  options: z.array(
    z.object({
      id: z.enum(["recommended", "accelerated", "thorough"]),
      name: z.string(),
      tagline: z.string(),
      totalWeeks: z.number(),
      sprintLengthWeeks: z.number(),
      recommended: z.boolean(),
      advantages: z.array(z.string()),
      drawbacks: z.array(z.string()),
      extraSteps: z.array(z.string()),
      skippedSteps: z.array(z.string()),
      extraAgents: z.array(z.string()),
      hitlGates: z.number(),
    }),
  ),
});

export const tasksSchema = z.object({
  tasks: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      detail: z.string(),
      phase: z.string(),
      team,
      startWeek: z.number(),
      durationWeeks: z.number(),
      dependsOn: z.array(z.string()),
      agent: z.string(),
      requiredRole: z.string(),
      requiredSeniority: seniority,
      requiredSkills: z.array(z.string()),
      criticality,
      isHITL: z.boolean(),
      hitlReason: z.string().optional(),
    }),
  ),
});

export const scenariosSchema = z.object({
  scenarios: z.array(
    z.object({
      id: z.enum(["base", "optimistic", "pessimistic"]),
      name: z.string(),
      narrative: z.string(),
      drivers: z.array(
        z.object({
          metric: z.string(),
          assumption: z.string(),
          effect: z.string(),
        }),
      ),
      outcomes: z.object({
        deliveryWeeks: z.number(),
        totalCostUsd: z.number(),
        featureCompleteness: z.number(),
        teamUtilization: z.number(),
        confidence: z.number(),
        riskLevel: z.enum(["Low", "Moderate", "Elevated", "High"]),
      }),
    }),
  ),
});

export const reportSchema = z.object({
  executiveSummary: z.string(),
  feasibilityScore: z.number(),
  verdict: z.string(),
  keyOutcomes: z.array(z.string()),
  risks: z.array(
    z.object({
      category: z.enum(["cost", "team", "timeline", "techdebt"]),
      title: z.string(),
      description: z.string(),
      severity: z.number(),
      likelihood: z.number(),
      mitigation: z.string(),
    }),
  ),
  gaps: z.array(
    z.object({
      role: z.string(),
      seniority,
      forTask: z.string(),
      impact: z.string(),
      suggestedAction: z.string(),
    }),
  ),
  recommendations: z.array(z.string()),
});
