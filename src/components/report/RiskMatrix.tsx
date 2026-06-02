"use client";

import type { ReportRisk } from "@/types";

const CATEGORY: Record<ReportRisk["category"], { icon: string; label: string }> =
  {
    cost: { icon: "💰", label: "Cost" },
    team: { icon: "👥", label: "Team" },
    timeline: { icon: "⏱", label: "Timeline" },
    techdebt: { icon: "🧱", label: "Tech debt" },
  };

function cellTint(product: number): string {
  // product ranges 1..25
  if (product >= 15) return "#ffe0c8";
  if (product >= 8) return "#fff0c2";
  if (product >= 4) return "#e9f7ee";
  return "#f1fdf7";
}

export function RiskMatrix({ risks }: { risks: ReportRisk[] }) {
  // rows: likelihood 5 (top) -> 1 (bottom); cols: severity 1 -> 5
  const rows = [5, 4, 3, 2, 1];
  const cols = [1, 2, 3, 4, 5];

  const at = (sev: number, lik: number) =>
    risks.filter((r) => r.severity === sev && r.likelihood === lik);

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center justify-center">
        <span className="text-[10px] font-bold uppercase tracking-wide text-muted -rotate-90 whitespace-nowrap">
          Likelihood →
        </span>
      </div>
      <div>
        <div className="grid grid-cols-5 gap-1.5">
          {rows.map((lik) =>
            cols.map((sev) => {
              const here = at(sev, lik);
              return (
                <div
                  key={`${sev}-${lik}`}
                  className="relative grid h-14 w-full min-w-14 place-items-center rounded-xl"
                  style={{ backgroundColor: cellTint(sev * lik) }}
                >
                  {here.map((r, i) => (
                    <span
                      key={i}
                      title={`${CATEGORY[r.category].label}: ${r.title}`}
                      className="text-lg leading-none"
                    >
                      {CATEGORY[r.category].icon}
                    </span>
                  ))}
                </div>
              );
            }),
          )}
        </div>
        <div className="mt-1.5 text-center text-[10px] font-bold uppercase tracking-wide text-muted">
          Severity →
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          {Object.entries(CATEGORY).map(([k, v]) => (
            <span key={k} className="flex items-center gap-1 text-xs text-forest">
              {v.icon} {v.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
