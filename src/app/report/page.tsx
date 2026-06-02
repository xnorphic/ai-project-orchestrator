"use client";

import { useRouter } from "next/navigation";
import { useProject } from "@/lib/store/project-store";
import { useHydrated } from "@/lib/use-hydrated";
import { Button, Card, SectionTitle, Spinner } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScoreGauge } from "@/components/report/ScoreGauge";
import { RiskMatrix } from "@/components/report/RiskMatrix";

const SEVERITY_WORD = ["", "Very low", "Low", "Medium", "High", "Critical"];

export default function ReportPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const prd = useProject((s) => s.prd);
  const report = useProject((s) => s.report);
  const reset = useProject((s) => s.reset);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24">
        <Spinner label="Loading the report…" />
      </div>
    );
  }

  if (!prd || !report) {
    return (
      <EmptyState
        title="No report yet"
        desc="Model the scenarios and the report agent will compile feasibility."
        href="/scenarios"
        cta="Go to scenarios"
      />
    );
  }

  function startOver() {
    reset();
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <SectionTitle
        eyebrow="Step 6 · Feasibility report"
        title={`Delivery assessment — ${prd.title}`}
      />

      <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-stretch">
        <Card className="p-7">
          <div className="text-xs font-bold uppercase tracking-wide text-careem-deep mb-2">
            Executive summary
          </div>
          <p className="text-[15px] leading-relaxed text-forest font-[family-name:var(--font-ui)]">
            {report.executiveSummary}
          </p>

          <div className="mt-5">
            <div className="text-xs font-bold uppercase tracking-wide text-careem-deep mb-2">
              Key outcomes
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {report.keyOutcomes.map((k, i) => (
                <div
                  key={i}
                  className="flex gap-2 rounded-2xl bg-mint-50 px-4 py-2.5 text-sm text-forest font-[family-name:var(--font-ui)]"
                >
                  <span className="text-careem-deep">◆</span>
                  {k}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-7 flex flex-col items-center justify-center min-w-64">
          <ScoreGauge score={report.feasibilityScore} />
          <div className="mt-3 text-center">
            <div className="font-extrabold text-midnight">{report.verdict}</div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6 mt-6 items-start">
        {/* Risks */}
        <Card className="p-7">
          <h3 className="font-extrabold text-midnight mb-4">Delivery risks</h3>
          <div className="space-y-3">
            {report.risks.map((r, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[color:var(--border)] p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-midnight capitalize">
                    {r.category === "techdebt" ? "tech backlog" : r.category} ·{" "}
                    {r.title}
                  </span>
                  <span className="text-[11px] font-semibold text-muted">
                    sev {SEVERITY_WORD[r.severity]} · lik{" "}
                    {SEVERITY_WORD[r.likelihood]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted font-[family-name:var(--font-ui)]">
                  {r.description}
                </p>
                <p className="mt-1.5 text-xs font-semibold text-forest">
                  Mitigation: {r.mitigation}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Matrix + gaps */}
        <div className="space-y-6">
          <Card className="p-7">
            <h3 className="font-extrabold text-midnight mb-4">Risk matrix</h3>
            <RiskMatrix risks={report.risks} />
          </Card>

          <Card className="p-7">
            <h3 className="font-extrabold text-midnight mb-3">
              Personnel gaps
            </h3>
            {report.gaps.length === 0 ? (
              <div className="rounded-2xl bg-mint-50 px-4 py-5 text-center text-sm font-semibold text-forest">
                ✓ Staffing covers every critical gate.
              </div>
            ) : (
              <div className="space-y-2">
                {report.gaps.map((g, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-peach-100/40 px-4 py-3 text-sm"
                  >
                    <div className="font-bold text-[#9a5300]">
                      {g.seniority} {g.role} — {g.forTask}
                    </div>
                    <p className="text-xs text-[#9a5300]/90 mt-1 font-[family-name:var(--font-ui)]">
                      {g.impact}
                    </p>
                    <p className="text-xs font-semibold text-forest mt-1">
                      → {g.suggestedAction}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <Card className="p-7 mt-6">
        <h3 className="font-extrabold text-midnight mb-3">Recommendations</h3>
        <div className="space-y-2">
          {report.recommendations.map((r, i) => (
            <div
              key={i}
              className="flex gap-3 rounded-2xl bg-sky-50 px-4 py-3 text-sm text-forest font-[family-name:var(--font-ui)]"
            >
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-careem text-[11px] font-bold text-midnight">
                {i + 1}
              </span>
              {r}
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-8 flex items-center justify-between">
        <p className="text-sm text-muted font-[family-name:var(--font-ui)]">
          That is the full plan — PRD, timeline, staffed Gantt, scenarios, and
          this report.
        </p>
        <Button variant="outline" onClick={startOver}>
          Plan another project
        </Button>
      </div>
    </div>
  );
}
