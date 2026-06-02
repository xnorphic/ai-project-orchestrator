"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useProject } from "@/lib/store/project-store";
import { useHydrated } from "@/lib/use-hydrated";
import { Button, SectionTitle, Spinner } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScenarioCard } from "@/components/scenarios/ScenarioCard";
import { postAgent } from "@/lib/api";
import type { FeasibilityReport, ScenarioId } from "@/types";

const DISPLAY_ORDER: ScenarioId[] = ["optimistic", "base", "pessimistic"];

export default function ScenariosPage() {
  const router = useRouter();
  const hydrated = useHydrated();

  const prd = useProject((s) => s.prd);
  const tasks = useProject((s) => s.tasks);
  const scenarios = useProject((s) => s.scenarios);
  const timelineOptions = useProject((s) => s.timelineOptions);
  const selectedTimelineId = useProject((s) => s.selectedTimelineId);
  const setReport = useProject((s) => s.setReport);
  const reach = useProject((s) => s.reach);

  const [loading, setLoading] = useState(false);

  const ordered = useMemo(
    () =>
      DISPLAY_ORDER.map((id) => scenarios.find((s) => s.id === id)).filter(
        (s): s is NonNullable<typeof s> => Boolean(s),
      ),
    [scenarios],
  );

  const assignments = useMemo(() => {
    const m: Record<string, string> = {};
    tasks.forEach((t) => {
      if (t.assignedPersonId) m[t.id] = t.assignedPersonId;
    });
    return m;
  }, [tasks]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24">
        <Spinner label="Loading scenarios…" />
      </div>
    );
  }

  if (!prd || scenarios.length === 0) {
    return (
      <EmptyState
        title="No scenarios yet"
        desc="Build the plan and the scenario agent will model outcomes."
        href="/gantt"
        cta="Go to the plan"
      />
    );
  }

  const option = timelineOptions.find((o) => o.id === selectedTimelineId);

  async function continueToReport() {
    setLoading(true);
    try {
      const data = await postAgent<{ report: FeasibilityReport }>("/api/report", {
        prd,
        tasks,
        option,
        assignments,
        scenarios,
      });
      setReport(data.report);
      reach("report");
      router.push("/report");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <SectionTitle
        eyebrow="Step 5 · Scenario modelling"
        title="Base, optimistic & pessimistic outcomes"
        desc="Each scenario is driven by how the key outputs land — engineering velocity, scope stability, and the pricing-to-conversion chain. The pessimistic case shows how a 20% fee hike cutting conversion by ~80% pushes the business into recovery."
      />

      <div className="grid lg:grid-cols-3 gap-5 items-start">
        {ordered.map((s) => (
          <ScenarioCard
            key={s.id}
            scenario={s}
            highlight={s.id === "base"}
          />
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        {loading ? (
          <Spinner label="Compiling the feasibility report…" />
        ) : (
          <Button size="lg" onClick={continueToReport}>
            Generate feasibility report →
          </Button>
        )}
      </div>
    </div>
  );
}
