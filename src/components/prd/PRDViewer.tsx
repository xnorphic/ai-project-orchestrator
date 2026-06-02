"use client";

import type { PRD } from "@/types";
import { Badge } from "@/components/ui/primitives";

function List({ items, marker }: { items: string[]; marker: string }) {
  return (
    <ul className="space-y-1.5">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2.5 text-sm text-forest/90 font-[family-name:var(--font-ui)]">
          <span className="mt-0.5 shrink-0 text-careem-deep">{marker}</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-careem-deep">
        {title}
      </h3>
      {children}
    </section>
  );
}

export function PRDViewer({ prd }: { prd: PRD }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-midnight">{prd.title}</h2>
        <p className="mt-1 text-muted font-[family-name:var(--font-ui)]">{prd.oneLiner}</p>
      </div>

      <Block title="Problem">
        <p className="text-sm text-forest/90 leading-relaxed font-[family-name:var(--font-ui)]">
          {prd.problemStatement}
        </p>
      </Block>

      <div className="grid sm:grid-cols-2 gap-6">
        <Block title="Goals">
          <List items={prd.goals} marker="◆" />
        </Block>
        <Block title="Non-goals">
          <List items={prd.nonGoals} marker="✕" />
        </Block>
      </div>

      <Block title="Target users">
        <div className="flex flex-wrap gap-2">
          {prd.targetUsers.map((u, i) => (
            <Badge key={i} color="#eef9fb" text="#0b5a73">
              {u}
            </Badge>
          ))}
        </div>
      </Block>

      <Block title="User stories">
        <div className="space-y-2">
          {prd.userStories.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl bg-mint-50 border border-[color:var(--border)] px-4 py-3 text-sm text-forest font-[family-name:var(--font-ui)]"
            >
              As <strong>{s.persona}</strong>, I want to{" "}
              <strong>{s.want}</strong> so that <strong>{s.soThat}</strong>.
            </div>
          ))}
        </div>
      </Block>

      <div className="grid sm:grid-cols-2 gap-6">
        <Block title="Functional requirements">
          <List items={prd.functionalRequirements} marker="▸" />
        </Block>
        <Block title="Non-functional requirements">
          <List items={prd.nonFunctionalRequirements} marker="▸" />
        </Block>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <Block title="Success metrics">
          <List items={prd.successMetrics} marker="↑" />
        </Block>
        <Block title="Assumptions">
          <List items={prd.assumptions} marker="•" />
        </Block>
      </div>

      <Block title="Open risks">
        <div className="space-y-1.5">
          {prd.openRisks.map((r, i) => (
            <div
              key={i}
              className="flex gap-2.5 rounded-xl bg-peach-100/60 px-3 py-2 text-sm text-[#9a5300] font-[family-name:var(--font-ui)]"
            >
              <span>⚠</span>
              <span>{r}</span>
            </div>
          ))}
        </div>
      </Block>
    </div>
  );
}
