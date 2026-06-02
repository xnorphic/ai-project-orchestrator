"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useProject } from "@/lib/store/project-store";
import { useHydrated } from "@/lib/use-hydrated";
import { Button, Card, SectionTitle, Spinner } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/EmptyState";
import { GanttChart } from "@/components/gantt/GanttChart";
import { GanttLegend } from "@/components/gantt/GanttLegend";
import {
  assignPersonnel,
  computeGaps,
  rankCandidates,
} from "@/lib/logic/matching";
import { personById } from "@/lib/demo-data/personnel-list";
import { postAgent } from "@/lib/api";
import { initials, usd } from "@/lib/brand";
import type { Scenario } from "@/types";

function Stat({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: string;
}) {
  return (
    <Card className="px-5 py-4">
      <div
        className="text-2xl font-extrabold"
        style={{ color: accent ?? "#001942" }}
      >
        {value}
      </div>
      <div className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </div>
    </Card>
  );
}

export default function GanttPage() {
  const router = useRouter();
  const hydrated = useHydrated();

  const prd = useProject((s) => s.prd);
  const tasks = useProject((s) => s.tasks);
  const sprintLength = useProject((s) => s.sprintLengthWeeks);
  const selectedTimelineId = useProject((s) => s.selectedTimelineId);
  const timelineOptions = useProject((s) => s.timelineOptions);
  const assignPerson = useProject((s) => s.assignPerson);
  const setScenarios = useProject((s) => s.setScenarios);
  const reach = useProject((s) => s.reach);

  const [assigning, setAssigning] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [continuing, setContinuing] = useState(false);
  const requested = useRef(false);

  const anyAssigned = tasks.some((t) => t.assignedPersonId);

  useEffect(() => {
    if (!hydrated || tasks.length === 0 || anyAssigned || requested.current)
      return;
    requested.current = true;
    setAssigning(true);
    (async () => {
      try {
        const data = await postAgent<{ assignments: Record<string, string> }>(
          "/api/personnel",
          { tasks },
        );
        const map: Record<string, string> = data.assignments ?? {};
        Object.entries(map).forEach(([taskId, personId]) =>
          assignPerson(taskId, personId),
        );
      } catch {
        const fallback = assignPersonnel(tasks);
        Object.entries(fallback.assignments).forEach(([taskId, personId]) =>
          assignPerson(taskId, personId),
        );
      } finally {
        setAssigning(false);
      }
    })();
  }, [hydrated, tasks, anyAssigned, assignPerson]);

  const assignments = useMemo(() => {
    const m: Record<string, string> = {};
    tasks.forEach((t) => {
      if (t.assignedPersonId) m[t.id] = t.assignedPersonId;
    });
    return m;
  }, [tasks]);

  const gaps = useMemo(
    () => (anyAssigned ? computeGaps(tasks, assignments) : []),
    [tasks, assignments, anyAssigned],
  );

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24">
        <Spinner label="Loading the plan…" />
      </div>
    );
  }

  if (!prd || tasks.length === 0) {
    return (
      <EmptyState
        title="No plan yet"
        desc="Pick a timeline and build the plan first."
        href="/timeline"
        cta="Choose a timeline"
      />
    );
  }

  const option = timelineOptions.find((o) => o.id === selectedTimelineId);
  const hitlCount = tasks.filter((t) => t.isHITL).length;
  const criticalPath = Math.max(...tasks.map((t) => t.startWeek + t.durationWeeks));
  const task = tasks.find((t) => t.id === selectedTask);

  async function continueToScenarios() {
    setContinuing(true);
    try {
      const data = await postAgent<{ scenarios: Scenario[] }>("/api/scenarios", {
        prd,
        tasks,
        option,
        assignments,
      });
      setScenarios(data.scenarios);
      reach("scenarios");
      router.push("/scenarios");
    } finally {
      setContinuing(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <SectionTitle
        eyebrow="Step 4 · Plan & staffing"
        title="The staffed delivery plan"
        desc="Color-coded by team, sequenced by dependency. Coral dashed bars are human-in-the-loop gates with an assigned senior owner. Click any task to review or reassign."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Stat value={`${tasks.length}`} label="Tasks" />
        <Stat value={`${hitlCount}`} label="HITL gates" accent="#fb6704" />
        <Stat value={`${criticalPath} wks`} label="Critical path" />
        <Stat
          value={`${gaps.length}`}
          label="Coverage gaps"
          accent={gaps.length ? "#fb6704" : "#00b368"}
        />
      </div>

      <div className="mb-3">
        <GanttLegend />
      </div>

      {assigning && (
        <div className="mb-3">
          <Spinner label="Personnel agent assigning owners…" />
        </div>
      )}

      <GanttChart
        tasks={tasks}
        sprintLength={sprintLength}
        selectedId={selectedTask}
        onSelect={setSelectedTask}
      />

      <div className="grid lg:grid-cols-2 gap-5 mt-5">
        {/* Selected task / reassign */}
        <Card className="p-6">
          {task ? (
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-midnight">
                  {task.isHITL ? "🚩 " : ""}
                  {task.name}
                </h3>
                <span className="text-xs font-semibold text-muted">
                  W{task.startWeek + 1}–{task.startWeek + task.durationWeeks}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted font-[family-name:var(--font-ui)]">
                {task.detail}
              </p>
              {task.isHITL && task.hitlReason && (
                <div className="mt-3 rounded-2xl bg-peach-100/60 px-4 py-3 text-sm text-[#9a5300]">
                  <strong>Why human-in-the-loop:</strong> {task.hitlReason}
                </div>
              )}
              <div className="mt-4">
                <div className="text-xs font-bold uppercase tracking-wide text-careem-deep mb-2">
                  Best-fit candidates ({task.requiredSeniority}+{" "}
                  {task.requiredRole})
                </div>
                <div className="space-y-2">
                  {rankCandidates(task)
                    .slice(0, 4)
                    .map((c) => {
                      const chosen = task.assignedPersonId === c.person.id;
                      return (
                        <button
                          key={c.person.id}
                          onClick={() => assignPerson(task.id, c.person.id)}
                          className={
                            "w-full flex items-center gap-3 rounded-2xl border px-3 py-2 text-left transition-all " +
                            (chosen
                              ? "border-careem bg-mint-50"
                              : "border-[color:var(--border)] hover:bg-mint-50")
                          }
                        >
                          <span
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: c.person.avatarColor }}
                          >
                            {initials(c.person.name)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-midnight">
                              {c.person.name}
                              <span className="ml-1.5 text-xs font-medium text-muted">
                                {c.person.seniority}
                              </span>
                            </span>
                            <span className="block text-xs text-muted truncate font-[family-name:var(--font-ui)]">
                              {c.reasons.join(" · ")}
                            </span>
                          </span>
                          <span className="shrink-0 text-right">
                            <span className="block text-sm font-bold text-forest">
                              {c.score}
                            </span>
                            <span className="block text-[10px] text-muted">
                              {usd(c.person.weeklyCost)}/wk
                            </span>
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid h-full min-h-40 place-items-center text-center text-muted">
              <div>
                <div className="text-3xl mb-2">👆</div>
                <p className="text-sm font-[family-name:var(--font-ui)]">
                  Select a task in the chart to review its owner and swap in a
                  different person.
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Gaps */}
        <Card className="p-6">
          <h3 className="font-extrabold text-midnight">
            Staffing gaps & risks
          </h3>
          {gaps.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-mint-50 px-4 py-6 text-center">
              <div className="text-2xl mb-1">✓</div>
              <p className="text-sm font-semibold text-forest">
                Every gate is covered by a qualified owner.
              </p>
            </div>
          ) : (
            <div className="mt-3 space-y-2.5">
              {gaps.map((g, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-[color:var(--border)] bg-peach-100/40 px-4 py-3"
                >
                  <div className="flex items-center gap-2 text-sm font-bold text-[#9a5300]">
                    <span>⚠</span>
                    {g.seniority} {g.role} — {g.forTask}
                  </div>
                  <p className="mt-1 text-xs text-[#9a5300]/90 font-[family-name:var(--font-ui)]">
                    {g.impact}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-forest">
                    → {g.suggestedAction}
                  </p>
                </div>
              ))}
              <p className="text-[11px] text-muted">
                Gaps are not blockers — they are carried into the feasibility
                report with their delivery risk.
              </p>
            </div>
          )}
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        {continuing ? (
          <Spinner label="Modelling scenarios…" />
        ) : (
          <Button size="lg" onClick={continueToScenarios}>
            Model delivery scenarios →
          </Button>
        )}
      </div>
    </div>
  );
}
