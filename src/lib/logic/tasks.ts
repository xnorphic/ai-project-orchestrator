import type {
  Criticality,
  PRD,
  Seniority,
  Task,
  Team,
  TimelineOption,
} from "@/types";

interface PhaseSpec {
  key: string;
  name: string;
  detail: string;
  phase: string;
  team: Team;
  agent: string;
  requiredRole: string;
  requiredSeniority: Seniority;
  requiredSkills: string[];
  weight: number; // share of the critical path
  criticality: Criticality;
  dependsOn: string[];
  overlapPrev?: boolean; // start halfway through the previous task
  isHITL?: boolean;
  hitlReason?: string;
  onlyThorough?: boolean;
  skipAccelerated?: boolean;
}

/**
 * Decompose a PRD into scheduled tasks for the chosen timeline.
 * Doubles as the deterministic fallback for the task agent.
 */
export function buildTasks(
  prd: PRD,
  option: TimelineOption,
): Task[] {
  const accelerated = option.id === "accelerated";
  const thorough = option.id === "thorough";

  const specs: PhaseSpec[] = [
    {
      key: "discovery",
      name: "Requirements & success metrics",
      detail: `Lock scope for "${prd.title}", finalize success metrics and acceptance criteria.`,
      phase: "Discovery",
      team: "Product",
      agent: "Requirements Agent",
      requiredRole: "Product Manager",
      requiredSeniority: "Mid",
      requiredSkills: ["PRD", "analytics"],
      weight: 0.08,
      criticality: "high",
      dependsOn: [],
    },
    {
      key: "prd-signoff",
      name: "PRD & scope sign-off",
      detail: "Human review of scope, goals, and non-goals before build begins.",
      phase: "Discovery",
      team: "Product",
      agent: "—",
      requiredRole: "Principal Product Manager",
      requiredSeniority: "Senior",
      requiredSkills: ["product strategy", "stakeholder mgmt"],
      weight: 0.03,
      criticality: "critical",
      dependsOn: ["discovery"],
      isHITL: true,
      hitlReason: "Scope and budget commitment — senior PM owns the decision.",
    },
    {
      key: "design",
      name: "UX flows & visual design",
      detail: "Design the core flows, states, and visual language.",
      phase: "Design",
      team: "Design",
      agent: "UX Design Agent",
      requiredRole: "Product Designer",
      requiredSeniority: "Mid",
      requiredSkills: ["UX", "prototyping"],
      weight: 0.12,
      criticality: "medium",
      dependsOn: ["prd-signoff"],
    },
    {
      key: "design-signoff",
      name: "Design sign-off",
      detail: "Senior design review for usability, accessibility, and brand fit.",
      phase: "Design",
      team: "Design",
      agent: "—",
      requiredRole: "Senior Product Designer",
      requiredSeniority: "Senior",
      requiredSkills: ["design systems", "accessibility"],
      weight: 0.02,
      criticality: "high",
      dependsOn: ["design"],
      isHITL: true,
      hitlReason: "Locks UX quality bar before engineering commits.",
      skipAccelerated: true,
    },
    {
      key: "architecture",
      name: "Technical design & architecture",
      detail: "Define services, data model, interfaces, and rollout strategy.",
      phase: "Architecture",
      team: "Engineering",
      agent: "Architecture Agent",
      requiredRole: "Staff Engineer",
      requiredSeniority: "Senior",
      requiredSkills: ["architecture", "distributed systems"],
      weight: 0.1,
      criticality: "critical",
      dependsOn: ["prd-signoff"],
      overlapPrev: true,
    },
    {
      key: "arch-review",
      name: "Architecture & security review",
      detail: "Critical review of design for scalability, security, and cost.",
      phase: "Architecture",
      team: "Engineering",
      agent: "—",
      requiredRole: "Staff Engineer",
      requiredSeniority: "Senior",
      requiredSkills: ["architecture", "security"],
      weight: 0.03,
      criticality: "critical",
      dependsOn: ["architecture"],
      isHITL: true,
      hitlReason: "Hardest decisions to reverse later — senior eng sign-off.",
    },
    {
      key: "backend",
      name: "Backend & API build",
      detail: "Implement services, persistence, and APIs per the architecture.",
      phase: "Build",
      team: "Engineering",
      agent: "Backend Agent",
      requiredRole: "Software Engineer II",
      requiredSeniority: "Mid",
      requiredSkills: ["Node", "REST"],
      weight: 0.2,
      criticality: "high",
      dependsOn: ["arch-review"],
    },
    {
      key: "frontend",
      name: "Frontend & mobile build",
      detail: "Implement client flows against the design and APIs.",
      phase: "Build",
      team: "Engineering",
      agent: "Frontend Agent",
      requiredRole: "Software Engineer II",
      requiredSeniority: "Mid",
      requiredSkills: ["React", "mobile"],
      weight: 0.18,
      criticality: "high",
      dependsOn: ["arch-review"],
      overlapPrev: true,
    },
    {
      key: "integration",
      name: "Integration & hardening",
      detail: "Wire client and services together; handle edge and error states.",
      phase: "Build",
      team: "Engineering",
      agent: "Integration Agent",
      requiredRole: "Software Engineer II",
      requiredSeniority: "Mid",
      requiredSkills: ["TypeScript", "performance"],
      weight: 0.09,
      criticality: "high",
      dependsOn: ["backend", "frontend"],
    },
    {
      key: "qa",
      name: accelerated ? "Smoke testing" : "QA & regression testing",
      detail: accelerated
        ? "Smoke test the happy path only — regression coverage deferred."
        : "Full functional and regression test pass across platforms.",
      phase: "Quality",
      team: "QA",
      agent: "QA Agent",
      requiredRole: "QA Engineer",
      requiredSeniority: accelerated ? "Junior" : "Mid",
      requiredSkills: accelerated ? ["manual testing"] : ["automation", "regression"],
      weight: accelerated ? 0.06 : 0.12,
      criticality: "high",
      dependsOn: ["integration"],
    },
    {
      key: "security",
      name: "Security audit & pen test",
      detail: "Threat model, dependency audit, and penetration testing.",
      phase: "Quality",
      team: "DevOps",
      agent: "Security Audit Agent",
      requiredRole: "Senior DevOps Engineer",
      requiredSeniority: "Senior",
      requiredSkills: ["security"],
      weight: 0.08,
      criticality: "critical",
      dependsOn: ["integration"],
      overlapPrev: true,
      onlyThorough: true,
      isHITL: true,
      hitlReason: "Security risk acceptance requires senior sign-off.",
    },
    {
      key: "qa-signoff",
      name: "QA sign-off",
      detail: "Quality gate confirming release readiness.",
      phase: "Quality",
      team: "QA",
      agent: "—",
      requiredRole: "QA Lead",
      requiredSeniority: "Senior",
      requiredSkills: ["test strategy"],
      weight: 0.02,
      criticality: "high",
      dependsOn: ["qa"],
      isHITL: true,
      hitlReason: "Final quality bar before production exposure.",
    },
    {
      key: "compliance",
      name: "Compliance & legal review",
      detail: "Regulatory and policy review for the launch markets.",
      phase: "Quality",
      team: "Business",
      agent: "Compliance Review Agent",
      requiredRole: "Director, Business",
      requiredSeniority: "Senior",
      requiredSkills: ["compliance"],
      weight: 0.06,
      criticality: "critical",
      dependsOn: ["qa"],
      onlyThorough: true,
      isHITL: true,
      hitlReason: "Regulatory accountability sits with senior business owner.",
    },
    {
      key: "release",
      name: "Release engineering & rollout",
      detail: "Pipelines, monitoring, staged rollout, and rollback plan.",
      phase: "Release",
      team: "DevOps",
      agent: "Release Agent",
      requiredRole: "DevOps Engineer",
      requiredSeniority: "Mid",
      requiredSkills: ["CI/CD", "monitoring"],
      weight: 0.08,
      criticality: "high",
      dependsOn: ["qa-signoff"],
    },
    {
      key: "release-approval",
      name: "Production release approval",
      detail: "Final go-live approval and risk acceptance.",
      phase: "Release",
      team: "DevOps",
      agent: "—",
      requiredRole: "Senior DevOps Engineer",
      requiredSeniority: "Senior",
      requiredSkills: ["release engineering"],
      weight: 0.02,
      criticality: "critical",
      dependsOn: ["release"],
      isHITL: true,
      hitlReason: "Production blast radius — senior DevOps owns the cutover.",
    },
    {
      key: "gtm",
      name: "Go-to-market & launch",
      detail: "Positioning, pricing, comms, and launch coordination.",
      phase: "Launch",
      team: "Business",
      agent: "GTM Agent",
      requiredRole: "Business Manager",
      requiredSeniority: "Mid",
      requiredSkills: ["GTM", "pricing"],
      weight: 0.08,
      criticality: "medium",
      dependsOn: ["release"],
      overlapPrev: true,
    },
    {
      key: "go-no-go",
      name: "Go / No-Go launch decision",
      detail: "Executive decision to launch based on all prior gates.",
      phase: "Launch",
      team: "Business",
      agent: "—",
      requiredRole: "Director, Business",
      requiredSeniority: "Senior",
      requiredSkills: ["P&L", "GTM"],
      weight: 0.02,
      criticality: "critical",
      dependsOn: ["release-approval", "gtm"],
      isHITL: true,
      hitlReason: "Final commercial accountability for the launch.",
    },
  ];

  const active = specs.filter((s) => {
    if (s.onlyThorough && !thorough) return false;
    if (s.skipAccelerated && accelerated) return false;
    return true;
  });

  const totalWeight = active.reduce((sum, s) => sum + s.weight, 0);
  const scale = option.totalWeeks / totalWeight;

  const scheduled = new Map<string, { start: number; dur: number }>();
  const tasks: Task[] = [];
  let cursor = 0;

  for (const s of active) {
    const dur = Math.max(1, Math.round(s.weight * scale));
    // Earliest start respects dependencies.
    const depEnd = s.dependsOn.reduce((max, dep) => {
      const d = scheduled.get(dep);
      return d ? Math.max(max, d.start + d.dur) : max;
    }, 0);

    let start = Math.max(cursor, depEnd);
    if (s.overlapPrev && tasks.length > 0) {
      const prev = tasks[tasks.length - 1];
      start = Math.max(depEnd, prev.startWeek + Math.floor(prev.durationWeeks / 2));
    }

    scheduled.set(s.key, { start, dur });
    cursor = s.overlapPrev ? cursor : start + dur;

    tasks.push({
      id: s.key,
      name: s.name,
      detail: s.detail,
      phase: s.phase,
      team: s.team,
      startWeek: start,
      durationWeeks: dur,
      dependsOn: s.dependsOn.filter((d) => active.some((a) => a.key === d)),
      agent: s.agent,
      requiredRole: s.requiredRole,
      requiredSeniority: s.requiredSeniority,
      requiredSkills: s.requiredSkills,
      criticality: s.criticality,
      isHITL: Boolean(s.isHITL),
      hitlReason: s.hitlReason,
      assignedPersonId: null,
    });
  }

  return tasks;
}
