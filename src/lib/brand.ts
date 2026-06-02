import type { Criticality, Team } from "@/types";

export const TEAM_COLORS: Record<
  Team,
  { bg: string; bar: string; text: string; label: string }
> = {
  Engineering: { bg: "#f0fbf5", bar: "#c8f5e0", text: "#00493e", label: "Engineering" },
  Product: { bg: "#eef9fb", bar: "#c2edf8", text: "#0b5a73", label: "Product" },
  QA: { bg: "#fff6ee", bar: "#ffe0c8", text: "#9a5300", label: "QA" },
  DevOps: { bg: "#f3f0fc", bar: "#ddd4f8", text: "#4b2e83", label: "DevOps" },
  Business: { bg: "#fffbe8", bar: "#fff0c2", text: "#7a5a00", label: "Business" },
  Design: { bg: "#eefcf7", bar: "#c4f1e6", text: "#0a5a4a", label: "Design" },
};

export const TEAMS: Team[] = [
  "Product",
  "Design",
  "Engineering",
  "DevOps",
  "QA",
  "Business",
];

export const HITL_COLOR = "#fb6704";
export const HITL_BG = "#ffe8d6";

export const CRITICALITY_COLORS: Record<Criticality, string> = {
  low: "#9bb0bb",
  medium: "#4bb3c7",
  high: "#f0a020",
  critical: "#fb6704",
};

export function usd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${Math.round(n)}`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
