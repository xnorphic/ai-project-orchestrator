export type Team =
  | "Product"
  | "Engineering"
  | "DevOps"
  | "QA"
  | "Business"
  | "Design";

export type Seniority = "Junior" | "Mid" | "Senior";

export type Criticality = "low" | "medium" | "high" | "critical";

export type RiskCategory = "cost" | "team" | "timeline" | "techdebt";

export type ScenarioId = "base" | "optimistic" | "pessimistic";

export type TimelineOptionId = "recommended" | "accelerated" | "thorough";

/* ----------------------------- Personnel ----------------------------- */

export interface Person {
  id: string;
  name: string;
  role: string;
  team: Team;
  seniority: Seniority;
  skills: string[];
  /** Fully-loaded cost per week in USD. */
  weeklyCost: number;
  /** 0-1 share of the person's time that is free for this project. */
  availability: number;
  currentProjects: { name: string; load: number }[];
  pastProjects: string[];
  avatarColor: string;
}

/* -------------------------------- PRD -------------------------------- */

export interface UserStory {
  persona: string;
  want: string;
  soThat: string;
}

export interface PRD {
  title: string;
  oneLiner: string;
  problemStatement: string;
  goals: string[];
  nonGoals: string[];
  targetUsers: string[];
  userStories: UserStory[];
  functionalRequirements: string[];
  nonFunctionalRequirements: string[];
  successMetrics: string[];
  assumptions: string[];
  openRisks: string[];
}

export interface ClarifyingQuestion {
  id: string;
  question: string;
  why: string;
  options: string[];
  recommended: string;
}

/* ----------------------------- Timeline ------------------------------ */

export interface TimelineOption {
  id: TimelineOptionId;
  name: string;
  tagline: string;
  totalWeeks: number;
  sprintLengthWeeks: number;
  recommended: boolean;
  advantages: string[];
  drawbacks: string[];
  /** Steps that are added (thorough) or skipped (accelerated). */
  extraSteps: string[];
  skippedSteps: string[];
  extraAgents: string[];
  hitlGates: number;
}

/* ------------------------------- Tasks ------------------------------- */

export interface Task {
  id: string;
  name: string;
  detail: string;
  phase: string;
  team: Team;
  startWeek: number;
  durationWeeks: number;
  dependsOn: string[];
  /** AI sub-agent that drives this task. */
  agent: string;
  requiredRole: string;
  requiredSeniority: Seniority;
  requiredSkills: string[];
  criticality: Criticality;
  isHITL: boolean;
  hitlReason?: string;
  /** Resolved at assignment time. */
  assignedPersonId?: string | null;
}

/* ----------------------------- Scenarios ----------------------------- */

export interface ScenarioDriver {
  metric: string;
  assumption: string;
  effect: string;
}

export interface Scenario {
  id: ScenarioId;
  name: string;
  narrative: string;
  drivers: ScenarioDriver[];
  outcomes: {
    deliveryWeeks: number;
    totalCostUsd: number;
    featureCompleteness: number; // 0-100
    teamUtilization: number; // 0-100
    confidence: number; // 0-100
    riskLevel: "Low" | "Moderate" | "Elevated" | "High";
  };
}

/* ------------------------------ Report ------------------------------- */

export interface ReportRisk {
  category: RiskCategory;
  title: string;
  description: string;
  severity: number; // 1-5
  likelihood: number; // 1-5
  mitigation: string;
}

export interface PersonnelGap {
  role: string;
  seniority: Seniority;
  forTask: string;
  impact: string;
  suggestedAction: string;
}

export interface FeasibilityReport {
  executiveSummary: string;
  feasibilityScore: number; // 0-100
  verdict: string;
  keyOutcomes: string[];
  risks: ReportRisk[];
  gaps: PersonnelGap[];
  recommendations: string[];
}

/* ----------------------------- Project ------------------------------- */

export type Step =
  | "idea"
  | "prd"
  | "timeline"
  | "gantt"
  | "scenarios"
  | "report";

export interface ProjectState {
  idea: string;
  prd: PRD | null;
  questions: ClarifyingQuestion[];
  answers: Record<string, string>;
  timelineOptions: TimelineOption[];
  selectedTimelineId: TimelineOptionId | null;
  sprintLengthWeeks: number;
  tasks: Task[];
  scenarios: Scenario[];
  report: FeasibilityReport | null;
}
