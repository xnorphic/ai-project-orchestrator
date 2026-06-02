"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { STEP_ORDER, useProject } from "@/lib/store/project-store";
import type { Step } from "@/types";
import { clsx } from "@/lib/clsx";

const STEP_META: { step: Step; label: string; href: string }[] = [
  { step: "idea", label: "Idea", href: "/" },
  { step: "prd", label: "PRD", href: "/prd" },
  { step: "timeline", label: "Timeline", href: "/timeline" },
  { step: "gantt", label: "Plan", href: "/gantt" },
  { step: "scenarios", label: "Scenarios", href: "/scenarios" },
  { step: "report", label: "Report", href: "/report" },
];

export function Navbar() {
  const pathname = usePathname();
  const furthest = useProject((s) => s.furthestStep);
  const furthestIdx = STEP_ORDER.indexOf(furthest);

  const currentIdx = STEP_META.findIndex((m) =>
    m.href === "/" ? pathname === "/" : pathname.startsWith(m.href),
  );

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-off-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-5 py-3">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-careem text-midnight font-extrabold shadow-[0_8px_18px_-8px_rgba(0,231,132,0.9)]">
            ⌁
          </span>
          <span className="font-extrabold tracking-tight text-midnight">
            Orchestrator
            <span className="ml-1 text-careem-deep">AI</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 overflow-x-auto">
          {STEP_META.map((m, i) => {
            const reached = i <= furthestIdx;
            const active = i === currentIdx;
            const node = (
              <span
                className={clsx(
                  "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors whitespace-nowrap",
                  active
                    ? "bg-forest text-off-white"
                    : reached
                      ? "text-forest hover:bg-mint-50"
                      : "text-muted/60 cursor-not-allowed",
                )}
              >
                <span
                  className={clsx(
                    "grid h-5 w-5 place-items-center rounded-full text-[11px] font-bold",
                    active
                      ? "bg-careem text-midnight"
                      : reached
                        ? "bg-mint-100 text-forest"
                        : "bg-[color:var(--border)] text-muted/70",
                  )}
                >
                  {i + 1}
                </span>
                {m.label}
              </span>
            );
            return reached ? (
              <Link key={m.step} href={m.href}>
                {node}
              </Link>
            ) : (
              <div key={m.step}>{node}</div>
            );
          })}
        </nav>

        <div className="ml-auto hidden sm:block text-xs font-semibold text-muted">
          Careem · Delivery Intelligence
        </div>
      </div>
    </header>
  );
}
