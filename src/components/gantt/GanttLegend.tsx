"use client";

import { TEAMS, TEAM_COLORS, HITL_COLOR, CRITICALITY_COLORS } from "@/lib/brand";

export function GanttLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-forest">
      {TEAMS.map((t) => (
        <span key={t} className="flex items-center gap-1.5">
          <span
            className="h-3 w-3 rounded-md"
            style={{ backgroundColor: TEAM_COLORS[t].bar }}
          />
          {t}
        </span>
      ))}
      <span className="flex items-center gap-1.5">
        <span
          className="h-3 w-4 rounded-md border-2 border-dashed"
          style={{ borderColor: HITL_COLOR }}
        />
        🚩 Human-in-the-loop
      </span>
      <span className="flex items-center gap-1.5 text-muted">
        criticality:
        {(["low", "medium", "high", "critical"] as const).map((c) => (
          <span key={c} className="flex items-center gap-1">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: CRITICALITY_COLORS[c] }}
            />
            {c}
          </span>
        ))}
      </span>
    </div>
  );
}
