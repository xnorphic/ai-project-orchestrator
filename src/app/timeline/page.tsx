"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProject } from "@/lib/store/project-store";
import { useHydrated } from "@/lib/use-hydrated";
import {
  Button,
  Card,
  Pill,
  SectionTitle,
  Spinner,
} from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/EmptyState";
import { TimelineCard } from "@/components/timeline/TimelineCard";
import { postAgent } from "@/lib/api";
import type { Task, TimelineOptionId } from "@/types";

export default function TimelinePage() {
  const router = useRouter();
  const hydrated = useHydrated();

  const prd = useProject((s) => s.prd);
  const options = useProject((s) => s.timelineOptions);
  const selectedId = useProject((s) => s.selectedTimelineId);
  const sprintLength = useProject((s) => s.sprintLengthWeeks);
  const selectTimeline = useProject((s) => s.selectTimeline);
  const setSprintLength = useProject((s) => s.setSprintLength);
  const setTasks = useProject((s) => s.setTasks);
  const reach = useProject((s) => s.reach);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hydrated && options.length > 0 && !selectedId) {
      const rec = options.find((o) => o.recommended) ?? options[0];
      selectTimeline(rec.id as TimelineOptionId);
    }
  }, [hydrated, options, selectedId, selectTimeline]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24">
        <Spinner label="Loading timeline options…" />
      </div>
    );
  }

  if (!prd || options.length === 0) {
    return (
      <EmptyState
        title="No timeline yet"
        desc="Review the PRD and generate the timeline first."
        href="/prd"
        cta="Go to the PRD"
      />
    );
  }

  const selected = options.find((o) => o.id === selectedId);

  async function buildPlan() {
    if (!selected) return;
    setLoading(true);
    try {
      const option = { ...selected, sprintLengthWeeks: sprintLength };
      const data = await postAgent<{ tasks: Task[] }>("/api/tasks", {
        prd,
        option,
      });
      setTasks(data.tasks);
      reach("gantt");
      router.push("/gantt");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <SectionTitle
        eyebrow="Step 3 · Timeline & cadence"
        title="Choose a delivery pace"
        desc="The recommended plan is balanced. Accelerated trades depth for speed; thorough adds review gates and agents. Pick one and adjust the sprint cadence."
      />

      <div className="grid md:grid-cols-3 gap-5 items-start">
        {options.map((o) => (
          <TimelineCard
            key={o.id}
            option={o}
            selected={o.id === selectedId}
            onSelect={() => selectTimeline(o.id as TimelineOptionId)}
          />
        ))}
      </div>

      <Card className="mt-6 p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <div className="text-sm font-bold text-midnight">Sprint length</div>
          <div className="text-xs text-muted font-[family-name:var(--font-ui)]">
            Shorter sprints mean tighter feedback loops.
          </div>
          <div className="mt-3 flex gap-2">
            {[1, 2, 4].map((w) => (
              <Pill
                key={w}
                active={sprintLength === w}
                onClick={() => setSprintLength(w)}
              >
                {w} week{w > 1 ? "s" : ""}
              </Pill>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {selected && (
            <div className="text-right">
              <div className="text-xs text-muted uppercase tracking-wide font-semibold">
                Plan
              </div>
              <div className="font-extrabold text-midnight">
                {selected.name} · {selected.totalWeeks} weeks ·{" "}
                {Math.ceil(selected.totalWeeks / sprintLength)} sprints
              </div>
            </div>
          )}
          {loading ? (
            <Spinner label="Decomposing into tasks…" />
          ) : (
            <Button size="lg" onClick={buildPlan}>
              Build the plan →
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
