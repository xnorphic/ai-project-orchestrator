"use client";

import type { Task } from "@/types";
import { buildProjectTeam, backlogLabel } from "@/lib/logic/team";
import { TEAM_COLORS, initials } from "@/lib/brand";

const TONE: Record<string, { bg: string; text: string }> = {
  light: { bg: "#f1fdf7", text: "#00785a" },
  moderate: { bg: "#fff6d6", text: "#7a5a00" },
  heavy: { bg: "#ffe8d6", text: "#9a5300" },
};

export function TeamBox({ tasks }: { tasks: Task[] }) {
  const team = buildProjectTeam(tasks);

  if (team.length === 0) {
    return (
      <div className="rounded-2xl bg-mint-50 px-4 py-5 text-center text-sm font-semibold text-forest">
        No personnel assigned yet — staff the Gantt to populate the team.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[color:var(--border)]">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-mint-50 text-left text-[11px] font-bold uppercase tracking-wide text-careem-deep">
            <th className="px-4 py-2.5">Member</th>
            <th className="px-3 py-2.5">Designation</th>
            <th className="px-3 py-2.5 text-center">On project</th>
            <th className="px-4 py-2.5">Current backlog</th>
          </tr>
        </thead>
        <tbody>
          {team.map(({ person, taskCount, hitlCount, backlogLoad, backlog }) => {
            const bl = backlogLabel(backlogLoad);
            const tone = TONE[bl.tone];
            const teamColor = TEAM_COLORS[person.team];
            return (
              <tr
                key={person.id}
                className="border-t border-[color:var(--border)] align-top"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white"
                      style={{ backgroundColor: person.avatarColor }}
                    >
                      {initials(person.name)}
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-midnight leading-tight">
                        {person.name}
                      </div>
                      <span
                        className="mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ backgroundColor: teamColor.bar, color: teamColor.text }}
                      >
                        {person.team}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="font-semibold text-forest font-[family-name:var(--font-ui)]">
                    {person.role}
                  </div>
                  <div className="text-[11px] text-muted">
                    {person.seniority} · {Math.round(person.availability * 100)}% free
                  </div>
                </td>
                <td className="px-3 py-3 text-center">
                  <div className="font-bold text-midnight">{taskCount}</div>
                  <div className="text-[11px] text-muted">
                    {taskCount === 1 ? "task" : "tasks"}
                    {hitlCount > 0 && (
                      <span className="text-coral"> · {hitlCount} HITL</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{ backgroundColor: tone.bg, color: tone.text }}
                    >
                      {bl.label} · {Math.round(backlogLoad * 100)}%
                    </span>
                  </div>
                  {backlog.length > 0 ? (
                    <div className="mt-1 text-[11px] text-muted font-[family-name:var(--font-ui)]">
                      {backlog
                        .map((b) => `${b.name} (${Math.round(b.load * 100)}%)`)
                        .join(", ")}
                    </div>
                  ) : (
                    <div className="mt-1 text-[11px] text-careem-deep font-semibold">
                      No competing projects
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
