"use client";

import { useRouter } from "next/navigation";
import { useProject } from "@/lib/store/project-store";
import { useHydrated } from "@/lib/use-hydrated";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/primitives";
import { TeamBox } from "@/components/report/TeamBox";
import { TEAM_COLORS, usd } from "@/lib/brand";
import type { ReactNode } from "react";

const SEVERITY_WORD = ["", "Very low", "Low", "Medium", "High", "Critical"];

export default function ExportPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const idea = useProject((s) => s.idea);
  const prd = useProject((s) => s.prd);
  const questions = useProject((s) => s.questions);
  const answers = useProject((s) => s.answers);
  const timelineOptions = useProject((s) => s.timelineOptions);
  const selectedTimelineId = useProject((s) => s.selectedTimelineId);
  const tasks = useProject((s) => s.tasks);
  const scenarios = useProject((s) => s.scenarios);
  const report = useProject((s) => s.report);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24">
        <Spinner label="Preparing the document…" />
      </div>
    );
  }

  if (!prd) {
    return (
      <EmptyState
        title="Nothing to export yet"
        desc="Start an idea and run the steps — then you can download the full plan as a PDF."
        href="/"
        cta="Start a project"
      />
    );
  }

  const selected =
    timelineOptions.find((o) => o.id === selectedTimelineId) ?? null;
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-[var(--off-white)] print:bg-white">
      {/* Toolbar — hidden when printing */}
      <div className="no-print sticky top-0 z-40 border-b border-[color:var(--border)] bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-[820px] items-center justify-between px-5 py-3">
          <button
            onClick={() => router.push("/report")}
            className="text-sm font-semibold text-forest hover:text-careem-deep"
          >
            ← Back to report
          </button>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted sm:block font-[family-name:var(--font-ui)]">
              Tip: choose “Save as PDF” in the print dialog
            </span>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-full bg-careem px-5 py-2 text-sm font-bold text-midnight shadow-sm transition-transform hover:scale-[1.02]"
            >
              <span aria-hidden>⬇</span> Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* The printable document */}
      <div className="mx-auto max-w-[820px] px-5 py-8 print:px-0 print:py-0">
        {/* Cover */}
        <Sheet>
          <div className="flex items-center gap-2 text-careem-deep">
            <span className="h-2.5 w-2.5 rounded-full bg-careem" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">
              AI Project Orchestrator
            </span>
          </div>
          <h1 className="mt-8 text-4xl font-extrabold leading-tight text-midnight">
            {prd.title}
          </h1>
          <p className="mt-3 text-lg text-forest font-[family-name:var(--font-ui)]">
            {prd.oneLiner}
          </p>

          {report && (
            <div className="mt-8 flex items-center gap-4 rounded-2xl bg-mint-50 p-5">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white text-2xl font-extrabold text-careem-deep">
                {report.feasibilityScore}
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-careem-deep">
                  Feasibility
                </div>
                <div className="font-bold text-midnight">{report.verdict}</div>
              </div>
            </div>
          )}

          <dl className="mt-8 grid grid-cols-2 gap-4 text-sm">
            <Meta label="Prepared" value={today} />
            <Meta
              label="Timeline"
              value={
                selected
                  ? `${selected.name} · ${selected.totalWeeks} weeks`
                  : "Not selected"
              }
            />
            <Meta label="Tasks" value={`${tasks.length} scheduled`} />
            <Meta
              label="HITL gates"
              value={`${tasks.filter((t) => t.isHITL).length}`}
            />
          </dl>

          <p className="mt-10 text-xs text-muted font-[family-name:var(--font-ui)]">
            Original idea: “{idea || prd.oneLiner}”
          </p>
        </Sheet>

        {/* PRD */}
        <Sheet>
          <StepHeading step="Step 1" title="Product requirements" />
          <Para label="Problem">{prd.problemStatement}</Para>
          <TwoCol>
            <Bullets title="Goals" items={prd.goals} />
            <Bullets title="Non-goals" items={prd.nonGoals} />
          </TwoCol>
          <Bullets title="Target users" items={prd.targetUsers} inline />
          <div className="avoid-break mt-4">
            <SubLabel>User stories</SubLabel>
            <div className="mt-1 space-y-1.5">
              {prd.userStories.map((s, i) => (
                <p
                  key={i}
                  className="text-sm text-forest font-[family-name:var(--font-ui)]"
                >
                  <span className="font-semibold text-midnight">{s.persona}</span>{" "}
                  wants {s.want} — so that {s.soThat}.
                </p>
              ))}
            </div>
          </div>
          <TwoCol>
            <Bullets
              title="Functional requirements"
              items={prd.functionalRequirements}
            />
            <Bullets
              title="Non-functional requirements"
              items={prd.nonFunctionalRequirements}
            />
          </TwoCol>
          <TwoCol>
            <Bullets title="Success metrics" items={prd.successMetrics} />
            <Bullets title="Assumptions" items={prd.assumptions} />
          </TwoCol>

          {questions.length > 0 && (
            <div className="avoid-break mt-4">
              <SubLabel>Decisions</SubLabel>
              <div className="mt-1 space-y-1.5">
                {questions.map((q) => (
                  <p
                    key={q.id}
                    className="text-sm text-forest font-[family-name:var(--font-ui)]"
                  >
                    <span className="font-semibold text-midnight">
                      {q.question}
                    </span>{" "}
                    → {answers[q.id] ?? q.recommended}
                  </p>
                ))}
              </div>
            </div>
          )}
        </Sheet>

        {/* Timeline */}
        {timelineOptions.length > 0 && (
          <Sheet>
            <StepHeading step="Steps 2–3" title="Timeline & delivery approach" />
            <div className="space-y-3">
              {timelineOptions.map((o) => {
                const isSel = o.id === selectedTimelineId;
                return (
                  <div
                    key={o.id}
                    className={`avoid-break rounded-2xl border p-4 ${
                      isSel
                        ? "border-careem bg-mint-50"
                        : "border-[color:var(--border)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-midnight">
                        {o.name}
                        {isSel && (
                          <span className="ml-2 rounded-full bg-careem px-2 py-0.5 text-[10px] font-bold text-midnight">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-forest">
                        {o.totalWeeks} wks · {o.sprintLengthWeeks}-wk sprints ·{" "}
                        {o.hitlGates} gates
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-muted font-[family-name:var(--font-ui)]">
                      {o.tagline}
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
                      <MiniList title="Advantages" items={o.advantages} />
                      <MiniList title="Drawbacks" items={o.drawbacks} />
                      {o.extraSteps.length > 0 && (
                        <MiniList title="Added steps" items={o.extraSteps} />
                      )}
                      {o.skippedSteps.length > 0 && (
                        <MiniList title="Skipped steps" items={o.skippedSteps} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Sheet>
        )}

        {/* Plan / Gantt as table */}
        {tasks.length > 0 && (
          <Sheet>
            <StepHeading step="Step 4" title="Delivery plan (staffed Gantt)" />
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-[color:var(--border)] text-left text-careem-deep">
                  <th className="py-2 pr-2">Task</th>
                  <th className="px-2 py-2">Team</th>
                  <th className="px-2 py-2 text-center">Wk</th>
                  <th className="px-2 py-2 text-center">Dur</th>
                  <th className="px-2 py-2">Owner role</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => {
                  const tc = TEAM_COLORS[t.team];
                  return (
                    <tr
                      key={t.id}
                      className="avoid-break border-b border-[color:var(--border)] align-top"
                    >
                      <td className="py-2 pr-2">
                        <span className="font-semibold text-midnight">
                          {t.name}
                        </span>
                        {t.isHITL && (
                          <span className="ml-1.5 rounded-full bg-coral-100 px-1.5 py-0.5 text-[9px] font-bold text-coral">
                            HITL
                          </span>
                        )}
                        <div className="text-[10px] text-muted">{t.phase}</div>
                      </td>
                      <td className="px-2 py-2">
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ backgroundColor: tc.bar, color: tc.text }}
                        >
                          {t.team}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center">{t.startWeek}</td>
                      <td className="px-2 py-2 text-center">
                        {t.durationWeeks}w
                      </td>
                      <td className="px-2 py-2 text-forest">
                        {t.requiredSeniority} {t.requiredRole}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Sheet>
        )}

        {/* Team */}
        {tasks.some((t) => t.assignedPersonId) && (
          <Sheet>
            <StepHeading step="Step 4 · Staffing" title="Project team & backlog" />
            <TeamBox tasks={tasks} />
          </Sheet>
        )}

        {/* Scenarios */}
        {scenarios.length > 0 && (
          <Sheet>
            <StepHeading step="Step 5" title="Delivery scenarios" />
            <div className="space-y-3">
              {scenarios.map((s) => (
                <div
                  key={s.id}
                  className="avoid-break rounded-2xl border border-[color:var(--border)] p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-midnight">{s.name}</div>
                    <div className="text-xs font-semibold text-forest">
                      {s.outcomes.deliveryWeeks} wks ·{" "}
                      {usd(s.outcomes.totalCostUsd)} ·{" "}
                      {s.outcomes.featureCompleteness}% complete ·{" "}
                      {s.outcomes.confidence}% conf · {s.outcomes.riskLevel} risk
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-muted font-[family-name:var(--font-ui)]">
                    {s.narrative}
                  </p>
                  <div className="mt-2 space-y-1">
                    {s.drivers.map((d, i) => (
                      <p key={i} className="text-xs text-forest">
                        <span className="font-semibold text-midnight">
                          {d.metric}:
                        </span>{" "}
                        {d.assumption} → {d.effect}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Sheet>
        )}

        {/* Report */}
        {report && (
          <Sheet last>
            <StepHeading step="Step 6" title="Feasibility report" />
            <Para label="Executive summary">{report.executiveSummary}</Para>
            <Bullets title="Key outcomes" items={report.keyOutcomes} />

            <div className="avoid-break mt-4">
              <SubLabel>Delivery risks</SubLabel>
              <div className="mt-1 space-y-2">
                {report.risks.map((r, i) => (
                  <div
                    key={i}
                    className="avoid-break rounded-xl border border-[color:var(--border)] p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-midnight capitalize">
                        {r.category === "techdebt" ? "tech backlog" : r.category}{" "}
                        · {r.title}
                      </span>
                      <span className="text-[11px] font-semibold text-muted">
                        sev {SEVERITY_WORD[r.severity]} · lik{" "}
                        {SEVERITY_WORD[r.likelihood]}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted font-[family-name:var(--font-ui)]">
                      {r.description}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-forest">
                      Mitigation: {r.mitigation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {report.gaps.length > 0 && (
              <div className="avoid-break mt-4">
                <SubLabel>Personnel gaps</SubLabel>
                <div className="mt-1 space-y-1.5">
                  {report.gaps.map((g, i) => (
                    <p key={i} className="text-sm text-[#9a5300]">
                      <span className="font-bold">
                        {g.seniority} {g.role} ({g.forTask}):
                      </span>{" "}
                      {g.impact} → {g.suggestedAction}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="avoid-break mt-4">
              <SubLabel>Recommendations</SubLabel>
              <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-forest font-[family-name:var(--font-ui)]">
                {report.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ol>
            </div>
          </Sheet>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- Layout bits ----------------------------- */

function Sheet({
  children,
  last,
}: {
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <section
      className={`avoid-break mb-6 rounded-3xl border border-[color:var(--border)] bg-white p-8 shadow-sm print:mb-0 print:rounded-none print:border-0 print:p-0 print:shadow-none ${
        last ? "" : "print-page"
      }`}
    >
      {children}
    </section>
  );
}

function StepHeading({ step, title }: { step: string; title: string }) {
  return (
    <div className="mb-4 border-b border-[color:var(--border)] pb-3">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-careem-deep">
        {step}
      </div>
      <h2 className="mt-1 text-2xl font-extrabold text-midnight">{title}</h2>
    </div>
  );
}

function SubLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-xs font-bold uppercase tracking-wide text-careem-deep">
      {children}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] p-3">
      <dt className="text-[11px] font-bold uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-0.5 font-semibold text-midnight">{value}</dd>
    </div>
  );
}

function Para({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="avoid-break mb-4">
      <SubLabel>{label}</SubLabel>
      <p className="mt-1 text-sm leading-relaxed text-forest font-[family-name:var(--font-ui)]">
        {children}
      </p>
    </div>
  );
}

function Bullets({
  title,
  items,
  inline,
}: {
  title: string;
  items: string[];
  inline?: boolean;
}) {
  if (!items || items.length === 0) return null;
  return (
    <div className="avoid-break mb-4">
      <SubLabel>{title}</SubLabel>
      {inline ? (
        <p className="mt-1 text-sm text-forest font-[family-name:var(--font-ui)]">
          {items.join(" · ")}
        </p>
      ) : (
        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-forest font-[family-name:var(--font-ui)]">
          {items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MiniList({ title, items }: { title: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <div className="font-bold text-midnight">{title}</div>
      <ul className="mt-0.5 list-disc space-y-0.5 pl-4 text-muted font-[family-name:var(--font-ui)]">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

function TwoCol({ children }: { children: ReactNode }) {
  return <div className="grid gap-x-6 sm:grid-cols-2">{children}</div>;
}
