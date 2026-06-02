"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Spinner } from "@/components/ui/primitives";
import { useProject } from "@/lib/store/project-store";
import {
  demoIdea,
  demoPRD,
  demoQuestions,
} from "@/lib/demo-data/feature-launch-project";

const EXAMPLES = [
  "A loyalty rewards program that turns ride spend into partner perks",
  "An AI dispatch assistant that rebalances drivers across a city in real time",
  "A group-ordering flow so colleagues can split a single food delivery",
];

export default function Home() {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setIdeaStore = useProject((s) => s.setIdea);
  const setPrdAndQuestions = useProject((s) => s.setPrdAndQuestions);
  const reach = useProject((s) => s.reach);
  const reset = useProject((s) => s.reset);

  async function submit(text: string) {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    reset();
    setIdeaStore(text.trim());
    try {
      const res = await fetch("/api/prd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: text.trim() }),
      });
      if (!res.ok) throw new Error("Failed to expand idea");
      const data = await res.json();
      setPrdAndQuestions(data.prd, data.questions);
      reach("prd");
      router.push("/prd");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  function loadDemo() {
    reset();
    setIdeaStore(demoIdea);
    setPrdAndQuestions(demoPRD, demoQuestions);
    reach("prd");
    router.push("/prd");
  }

  return (
    <div className="mx-auto max-w-3xl px-5 pt-16 pb-24 md:pt-24">
      <div className="text-center animate-float-in">
        <span className="inline-flex items-center gap-2 rounded-full bg-mint-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-forest">
          Multi-agent delivery planning
        </span>
        <h1 className="mt-6 text-4xl md:text-5xl font-extrabold leading-[1.05] text-midnight">
          Turn an idea into a{" "}
          <span className="text-careem-deep">staffed delivery plan</span>.
        </h1>
        <p className="mt-4 text-lg text-muted font-[family-name:var(--font-ui)]">
          Describe what you want to build. The orchestrator expands it into a
          PRD, plans the timeline, assigns owners with human-in-the-loop gates,
          and models base, optimistic, and pessimistic scenarios.
        </p>
      </div>

      <Card className="mt-10 p-3 animate-float-in">
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(idea);
          }}
          rows={4}
          disabled={loading}
          placeholder="e.g. Launch a Smart In-App Wallet with tap-to-pay at partner merchants…"
          className="w-full resize-none rounded-2xl bg-transparent px-4 py-3 text-midnight placeholder:text-muted/60 focus:outline-none font-[family-name:var(--font-ui)]"
        />
        <div className="flex items-center justify-between gap-3 px-2 pb-1">
          <span className="text-xs text-muted">⌘ + Enter to send</span>
          <div className="flex items-center gap-2">
            {loading ? (
              <Spinner label="Expanding into a PRD…" />
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={loadDemo}>
                  Load the demo project
                </Button>
                <Button size="md" onClick={() => submit(idea)}>
                  Start planning →
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {error && (
        <p className="mt-3 text-center text-sm text-coral font-semibold">
          {error}
        </p>
      )}

      <div className="mt-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-muted mb-3">
          Or try an example
        </p>
        <div className="flex flex-col gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              disabled={loading}
              onClick={() => submit(ex)}
              className="group rounded-2xl border border-[color:var(--border)] bg-white/70 px-4 py-3 text-left text-sm font-medium text-forest transition-all hover:border-careem hover:bg-mint-50 disabled:opacity-50"
            >
              <span className="mr-2 text-careem-deep group-hover:translate-x-0.5 inline-block transition-transform">
                →
              </span>
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
