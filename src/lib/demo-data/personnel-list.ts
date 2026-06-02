import type { Person } from "@/types";

/**
 * Demo file #2 — available personnel for human-in-the-loop checkpoints.
 *
 * Every role ships with a Junior, Mid, and Senior option. The choice trades
 * off speed, outcome quality, and cost:
 *   - Senior  -> fastest decisions, highest quality, highest weekly cost,
 *                usually the least availability (busiest).
 *   - Mid     -> balanced cost and throughput.
 *   - Junior  -> cheapest, most available, but slower and needs review.
 *
 * `currentProjects` reduces real availability and signals backlog risk.
 * `pastProjects` is used by the matching agent to judge domain fit.
 */
export const personnel: Person[] = [
  /* ----------------------------- Product ----------------------------- */
  {
    id: "pm-senior",
    name: "Layla Haddad",
    role: "Principal Product Manager",
    team: "Product",
    seniority: "Senior",
    skills: ["product strategy", "payments", "roadmapping", "stakeholder mgmt", "PRD"],
    weeklyCost: 5200,
    availability: 0.4,
    currentProjects: [
      { name: "Subscriptions Revamp", load: 0.4 },
      { name: "Q3 Planning", load: 0.2 },
    ],
    pastProjects: ["Careem Pay launch", "Wallet KYC flow", "Loyalty tiers"],
    avatarColor: "#00493e",
  },
  {
    id: "pm-mid",
    name: "Omar Khalil",
    role: "Product Manager",
    team: "Product",
    seniority: "Mid",
    skills: ["product discovery", "analytics", "PRD", "user research"],
    weeklyCost: 3400,
    availability: 0.7,
    currentProjects: [{ name: "Referrals v2", load: 0.3 }],
    pastProjects: ["Ride scheduling", "In-app surveys"],
    avatarColor: "#00b368",
  },
  {
    id: "pm-junior",
    name: "Nadia Saleh",
    role: "Associate Product Manager",
    team: "Product",
    seniority: "Junior",
    skills: ["backlog grooming", "analytics", "documentation"],
    weeklyCost: 1900,
    availability: 0.9,
    currentProjects: [],
    pastProjects: ["Help center revamp"],
    avatarColor: "#3ec98a",
  },

  /* --------------------------- Engineering --------------------------- */
  {
    id: "eng-senior",
    name: "Sara Mansour",
    role: "Staff Engineer",
    team: "Engineering",
    seniority: "Senior",
    skills: ["distributed systems", "payments", "Go", "Kotlin", "security", "architecture"],
    weeklyCost: 5600,
    availability: 0.3,
    currentProjects: [
      { name: "Ledger v2", load: 0.5 },
      { name: "On-call rotation", load: 0.2 },
    ],
    pastProjects: ["Careem Pay ledger", "Fraud engine", "Tap-to-pay POC"],
    avatarColor: "#001942",
  },
  {
    id: "eng-mid-1",
    name: "Karim Aziz",
    role: "Software Engineer II",
    team: "Engineering",
    seniority: "Mid",
    skills: ["TypeScript", "React Native", "Node", "payments", "REST"],
    weeklyCost: 3600,
    availability: 0.6,
    currentProjects: [{ name: "Wallet UI polish", load: 0.4 }],
    pastProjects: ["Wallet top-up", "Card management"],
    avatarColor: "#1f6feb",
  },
  {
    id: "eng-mid-2",
    name: "Yusuf Rahman",
    role: "Software Engineer II",
    team: "Engineering",
    seniority: "Mid",
    skills: ["Kotlin", "Android", "NFC", "mobile", "performance"],
    weeklyCost: 3500,
    availability: 0.75,
    currentProjects: [{ name: "Android upgrade", load: 0.25 }],
    pastProjects: ["NFC ticketing", "Offline mode"],
    avatarColor: "#2f81f7",
  },
  {
    id: "eng-junior",
    name: "Hana Tariq",
    role: "Software Engineer I",
    team: "Engineering",
    seniority: "Junior",
    skills: ["TypeScript", "React", "Node", "testing"],
    weeklyCost: 1900,
    availability: 0.95,
    currentProjects: [],
    pastProjects: ["Internal dashboards"],
    avatarColor: "#79c0ff",
  },

  /* ------------------------------ DevOps ----------------------------- */
  {
    id: "devops-senior",
    name: "Rami Fares",
    role: "Senior DevOps Engineer",
    team: "DevOps",
    seniority: "Senior",
    skills: ["Kubernetes", "Terraform", "AWS", "observability", "release engineering", "security"],
    weeklyCost: 5000,
    availability: 0.5,
    currentProjects: [{ name: "Multi-region failover", load: 0.4 }],
    pastProjects: ["Pay infra hardening", "Zero-downtime deploys"],
    avatarColor: "#6e40c9",
  },
  {
    id: "devops-mid",
    name: "Dina Mahmoud",
    role: "DevOps Engineer",
    team: "DevOps",
    seniority: "Mid",
    skills: ["CI/CD", "Docker", "AWS", "monitoring", "scripting"],
    weeklyCost: 3300,
    availability: 0.8,
    currentProjects: [{ name: "Pipeline migration", load: 0.2 }],
    pastProjects: ["GitHub Actions rollout"],
    avatarColor: "#8957e5",
  },

  /* -------------------------------- QA ------------------------------- */
  {
    id: "qa-senior",
    name: "Tarek Nasr",
    role: "QA Lead",
    team: "QA",
    seniority: "Senior",
    skills: ["test strategy", "automation", "payments testing", "security testing", "Appium"],
    weeklyCost: 4200,
    availability: 0.55,
    currentProjects: [{ name: "Regression suite", load: 0.35 }],
    pastProjects: ["Pay compliance testing", "Load testing wallet"],
    avatarColor: "#bf6500",
  },
  {
    id: "qa-mid",
    name: "Mona Said",
    role: "QA Engineer",
    team: "QA",
    seniority: "Mid",
    skills: ["manual testing", "automation", "Cypress", "regression"],
    weeklyCost: 2800,
    availability: 0.8,
    currentProjects: [],
    pastProjects: ["Checkout QA", "A/B test validation"],
    avatarColor: "#e3863b",
  },
  {
    id: "qa-junior",
    name: "Ali Reda",
    role: "Junior QA Analyst",
    team: "QA",
    seniority: "Junior",
    skills: ["manual testing", "bug triage", "test cases"],
    weeklyCost: 1600,
    availability: 0.95,
    currentProjects: [],
    pastProjects: ["Smoke testing"],
    avatarColor: "#f0a868",
  },

  /* ----------------------------- Business ---------------------------- */
  {
    id: "biz-senior",
    name: "Farah Idris",
    role: "Director, Business",
    team: "Business",
    seniority: "Senior",
    skills: ["pricing", "GTM", "P&L", "partnerships", "compliance"],
    weeklyCost: 5400,
    availability: 0.35,
    currentProjects: [
      { name: "Regional expansion", load: 0.4 },
      { name: "Bank partnerships", load: 0.25 },
    ],
    pastProjects: ["Pay GTM", "Merchant pricing model"],
    avatarColor: "#9a6700",
  },
  {
    id: "biz-mid",
    name: "Sami Boutros",
    role: "Business Manager",
    team: "Business",
    seniority: "Mid",
    skills: ["GTM", "market analysis", "pricing", "forecasting"],
    weeklyCost: 3200,
    availability: 0.7,
    currentProjects: [{ name: "Promo calendar", load: 0.3 }],
    pastProjects: ["Loyalty GTM"],
    avatarColor: "#c69026",
  },

  /* ------------------------------ Design ----------------------------- */
  {
    id: "design-senior",
    name: "Reem Qasim",
    role: "Senior Product Designer",
    team: "Design",
    seniority: "Senior",
    skills: ["UX", "design systems", "prototyping", "payments UX", "accessibility"],
    weeklyCost: 4100,
    availability: 0.5,
    currentProjects: [{ name: "Design system 2.0", load: 0.4 }],
    pastProjects: ["Wallet redesign", "Onboarding flow"],
    avatarColor: "#1b8f7a",
  },
  {
    id: "design-mid",
    name: "Jad Habib",
    role: "Product Designer",
    team: "Design",
    seniority: "Mid",
    skills: ["UI design", "prototyping", "user research"],
    weeklyCost: 2900,
    availability: 0.8,
    currentProjects: [],
    pastProjects: ["Referrals UI"],
    avatarColor: "#2bb89c",
  },
];

export function personById(id?: string | null): Person | undefined {
  if (!id) return undefined;
  return personnel.find((p) => p.id === id);
}
