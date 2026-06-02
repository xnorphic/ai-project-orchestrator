"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProject } from "@/lib/store/project-store";
import { useHydrated } from "@/lib/use-hydrated";
import { Button, Card, SectionTitle, Spinner } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/EmptyState";
import { PRDViewer } from "@/components/prd/PRDViewer";
import { postAgent } from "@/lib/api";
import type { TimelineOption } from "@/types";

export default function PRDPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const prd = useProject((s) => s.prd);
  const questions = useProject((s) => s.questions);
  const answers = useProject((s) => s.answers);
  const setAnswer = useProject((s) => s.setAnswer);
  const setTimelineOptions = useProject((s) => s.setTimelineOptions);
  const reach = useProject((s) => s.reach);

  const [loading, setLoading] = useState(false);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24">
        <Spinner label="Loading your project…" />
      </div>
    );
  }

  if (!prd) {
    return (
      <EmptyState
        title="No project yet"
        desc="Start with an idea and the orchestrator will expand it into a PRD."
        href="/"
        cta="Start with an idea"
      />
    );
  }

  async function generateTimeline() {
    setLoading(true);
    try {
      const data = await postAgent<{ options: TimelineOption[] }>(
        "/api/timeline",
        { prd, answers, questions },
      );
      setTimelineOptions(data.options);
      reach("timeline");
      router.push("/timeline");
    } finally {
      setLoading(false);
    }
  }

  const answered = questions.filter((q) => answers[q.id]).length;

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <SectionTitle
        eyebrow="Step 2 · Product Requirements"
        title="Review the PRD & answer a few questions"
        desc="The PRD on the left was expanded from your idea. Your answers on the right shape the timeline, staffing, and risk."
      />

      <div className="grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-6 items-start">
        <Card className="p-7">
          <PRDViewer prd={prd} />
        </Card>

        <div className="lg:sticky lg:top-20 space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-midnight">
                Clarifying questions
              </h3>
              <span className="text-xs font-semibold text-muted">
                {answered}/{questions.length} answered
              </span>
            </div>

            <div className="space-y-5">
              {questions.map((q) => (
                <div key={q.id}>
                  <p className="text-sm font-semibold text-midnight">
                    {q.question}
                  </p>
                  <p className="mt-0.5 text-xs text-muted font-[family-name:var(--font-ui)]">
                    {q.why}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {q.options.map((opt) => {
                      const selected =
                        (answers[q.id] ?? q.recommended) === opt;
                      const isRec = opt === q.recommended;
                      return (
                        <button
                          key={opt}
                          onClick={() => setAnswer(q.id, opt)}
                          className={
                            "rounded-full px-3 py-1.5 text-xs font-semibold transition-all border " +
                            (selected
                              ? "bg-forest text-off-white border-forest"
                              : "bg-white text-forest border-[color:var(--border)] hover:bg-mint-50")
                          }
                        >
                          {opt}
                          {isRec && (
                            <span
                              className={
                                "ml-1.5 " +
                                (selected ? "text-careem" : "text-careem-deep")
                              }
                            >
                              ★
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-[11px] text-muted">
              ★ marks the recommended answer. Unanswered questions use the
              recommendation.
            </p>
          </Card>

          <Card className="p-5 flex items-center justify-between">
            {loading ? (
              <Spinner label="Planning the timeline…" />
            ) : (
              <>
                <span className="text-sm text-muted font-[family-name:var(--font-ui)]">
                  Ready to plan the timeline?
                </span>
                <Button onClick={generateTimeline}>Generate timeline →</Button>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
