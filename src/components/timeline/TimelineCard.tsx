"use client";

import type { TimelineOption } from "@/types";
import { clsx } from "@/lib/clsx";
import { Badge } from "@/components/ui/primitives";

export function TimelineCard({
  option,
  selected,
  onSelect,
}: {
  option: TimelineOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const accent =
    option.id === "recommended"
      ? "#00e784"
      : option.id === "accelerated"
        ? "#fb6704"
        : "#7f5ffa";

  return (
    <button
      onClick={onSelect}
      className={clsx(
        "group relative w-full text-left rounded-3xl border-2 bg-white p-6 transition-all duration-200",
        selected
          ? "border-[color:var(--c)] shadow-[0_24px_50px_-28px_rgba(0,25,66,0.4)] -translate-y-0.5"
          : "border-[color:var(--border)] hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-30px_rgba(0,25,66,0.35)]",
      )}
      style={{ ["--c" as string]: accent }}
    >
      {option.recommended && (
        <span className="absolute -top-3 left-6 rounded-full bg-careem px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-midnight shadow">
          Recommended
        </span>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-extrabold text-midnight">{option.name}</h3>
        <span
          className={clsx(
            "grid h-6 w-6 place-items-center rounded-full border-2 transition-colors",
            selected ? "bg-[color:var(--c)] border-[color:var(--c)]" : "border-[color:var(--border)]",
          )}
        >
          {selected && <span className="text-xs text-white">✓</span>}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted font-[family-name:var(--font-ui)]">
        {option.tagline}
      </p>

      <div className="mt-4 flex items-center gap-4">
        <div>
          <div className="text-3xl font-extrabold text-midnight">
            {option.totalWeeks}
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            weeks
          </div>
        </div>
        <div className="h-10 w-px bg-[color:var(--border)]" />
        <div className="space-y-1">
          <Badge color="#eef9fb" text="#0b5a73">
            {option.sprintLengthWeeks}-wk sprints
          </Badge>
          <Badge color="#ffe8d6" text="#9a5300">
            {option.hitlGates} HITL gates
          </Badge>
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        {option.advantages.slice(0, 4).map((a, i) => (
          <div key={i} className="flex gap-2 text-xs text-forest/90 font-[family-name:var(--font-ui)]">
            <span className="text-careem-deep">+</span>
            {a}
          </div>
        ))}
        {option.drawbacks.slice(0, 4).map((d, i) => (
          <div key={i} className="flex gap-2 text-xs text-[#9a5300] font-[family-name:var(--font-ui)]">
            <span className="text-coral">–</span>
            {d}
          </div>
        ))}
      </div>

      {option.skippedSteps.length > 0 && (
        <div className="mt-4 rounded-2xl bg-peach-100/50 px-3 py-2">
          <div className="text-[11px] font-bold uppercase tracking-wide text-[#9a5300]">
            Skipped
          </div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {option.skippedSteps.map((s) => (
              <span key={s} className="text-[11px] text-[#9a5300] font-medium">
                {s} ·
              </span>
            ))}
          </div>
        </div>
      )}

      {option.extraSteps.length > 0 && option.id === "thorough" && (
        <div className="mt-4 rounded-2xl bg-lavender-100 px-3 py-2">
          <div className="text-[11px] font-bold uppercase tracking-wide text-[#4b2e83]">
            Added steps
          </div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {option.extraSteps.map((s) => (
              <span key={s} className="text-[11px] text-[#4b2e83] font-medium">
                {s} ·
              </span>
            ))}
          </div>
        </div>
      )}

      {option.extraAgents.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {option.extraAgents.map((a) => (
            <Badge key={a} color="#ece7fb" text="#4b2e83">
              + {a}
            </Badge>
          ))}
        </div>
      )}
    </button>
  );
}
