"use client";

import type { Scenario } from "@/types";
import { usd } from "@/lib/brand";
import { clsx } from "@/lib/clsx";

const THEME: Record<
  Scenario["id"],
  { ring: string; chip: string; chipText: string; emoji: string }
> = {
  optimistic: { ring: "#00e784", chip: "#d6ffea", chipText: "#00493e", emoji: "🌤" },
  base: { ring: "#a6edf2", chip: "#d8f3f6", chipText: "#0b5a73", emoji: "🎯" },
  pessimistic: { ring: "#fb6704", chip: "#ffe0c8", chipText: "#9a5300", emoji: "🌧" },
};

const RISK_COLOR: Record<string, string> = {
  Low: "#00b368",
  Moderate: "#0b9bb5",
  Elevated: "#f0a020",
  High: "#fb6704",
};

function Metric({
  label,
  value,
  bar,
  color,
}: {
  label: string;
  value: string;
  bar?: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted font-[family-name:var(--font-ui)]">{label}</span>
        <span className="font-bold text-midnight">{value}</span>
      </div>
      {bar !== undefined && (
        <div className="mt-1 h-1.5 w-full rounded-full bg-[color:var(--border)]">
          <div
            className="h-1.5 rounded-full transition-all"
            style={{ width: `${bar}%`, backgroundColor: color }}
          />
        </div>
      )}
    </div>
  );
}

export function ScenarioCard({
  scenario,
  highlight,
}: {
  scenario: Scenario;
  highlight?: boolean;
}) {
  const t = THEME[scenario.id];
  const o = scenario.outcomes;

  return (
    <div
      className={clsx(
        "rounded-3xl border-2 bg-white p-6 transition-all",
        highlight ? "shadow-[0_24px_50px_-28px_rgba(0,25,66,0.4)]" : "",
      )}
      style={{ borderColor: highlight ? t.ring : "var(--border)" }}
    >
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-extrabold text-midnight">
          <span>{t.emoji}</span>
          {scenario.name}
        </h3>
        <span
          className="rounded-full px-2.5 py-1 text-xs font-bold"
          style={{ backgroundColor: t.chip, color: t.chipText }}
        >
          {o.riskLevel} risk
        </span>
      </div>

      <p className="mt-2 text-sm text-muted leading-relaxed font-[family-name:var(--font-ui)]">
        {scenario.narrative}
      </p>

      <div className="my-5 grid grid-cols-2 gap-x-5 gap-y-1">
        <div>
          <div className="text-2xl font-extrabold text-midnight">
            {o.deliveryWeeks}
            <span className="text-sm font-semibold text-muted"> wks</span>
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Delivery
          </div>
        </div>
        <div>
          <div className="text-2xl font-extrabold text-midnight">
            {usd(o.totalCostUsd)}
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Total cost
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Metric
          label="Feature completeness"
          value={`${o.featureCompleteness}%`}
          bar={o.featureCompleteness}
          color={t.ring}
        />
        <Metric
          label="Team utilization"
          value={`${o.teamUtilization}%`}
          bar={o.teamUtilization}
          color={o.teamUtilization > 90 ? "#fb6704" : t.ring}
        />
        <Metric
          label="Confidence"
          value={`${o.confidence}%`}
          bar={o.confidence}
          color={RISK_COLOR[o.riskLevel]}
        />
      </div>

      <div className="mt-5 border-t border-[color:var(--border)] pt-4">
        <div className="text-xs font-bold uppercase tracking-wide text-careem-deep mb-2">
          Key drivers
        </div>
        <div className="space-y-2">
          {scenario.drivers.map((d, i) => (
            <div key={i} className="text-xs">
              <div className="font-semibold text-midnight">{d.metric}</div>
              <div className="text-muted font-[family-name:var(--font-ui)]">
                {d.assumption}{" "}
                <span className="text-forest font-semibold">→ {d.effect}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
