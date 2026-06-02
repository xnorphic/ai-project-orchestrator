"use client";

import type { Task } from "@/types";
import { personById } from "@/lib/demo-data/personnel-list";
import { TEAM_COLORS, HITL_COLOR, CRITICALITY_COLORS, initials } from "@/lib/brand";

const LABEL_W = 250;
const WEEK_PX = 46;
const ROW_H = 48;
const HEADER_H = 58;
const PAD = 16;

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export function GanttChart({
  tasks,
  sprintLength,
  selectedId,
  onSelect,
}: {
  tasks: Task[];
  sprintLength: number;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const totalWeeks = Math.max(
    1,
    ...tasks.map((t) => t.startWeek + t.durationWeeks),
  );
  const indexById = new Map(tasks.map((t, i) => [t.id, i]));

  const chartW = LABEL_W + totalWeeks * WEEK_PX + PAD;
  const chartH = HEADER_H + tasks.length * ROW_H + PAD;

  const sprintCount = Math.ceil(totalWeeks / sprintLength);

  return (
    <div className="overflow-x-auto rounded-3xl border border-[color:var(--border)] bg-white p-2">
      <svg
        width={chartW}
        height={chartH}
        style={{ minWidth: chartW }}
        role="img"
        aria-label="Project Gantt chart"
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 9 5 L 0 9" fill="none" stroke="#9bb0bb" strokeWidth="1.6" />
          </marker>
        </defs>

        {/* Sprint background bands */}
        {Array.from({ length: sprintCount }).map((_, s) => {
          const x = LABEL_W + s * sprintLength * WEEK_PX;
          const w = Math.min(sprintLength, totalWeeks - s * sprintLength) * WEEK_PX;
          return (
            <g key={`sprint-${s}`}>
              <rect
                x={x}
                y={HEADER_H - 24}
                width={w}
                height={chartH - HEADER_H + 24 - PAD}
                fill={s % 2 === 0 ? "#f6fdfa" : "#ffffff"}
              />
              <text
                x={x + w / 2}
                y={HEADER_H - 32}
                textAnchor="middle"
                className="fill-[#6b7b85]"
                fontSize="10"
                fontWeight={700}
                style={{ letterSpacing: "0.08em" }}
              >
                SPRINT {s + 1}
              </text>
            </g>
          );
        })}

        {/* Week gridlines + numbers */}
        {Array.from({ length: totalWeeks + 1 }).map((_, w) => {
          const x = LABEL_W + w * WEEK_PX;
          return (
            <g key={`week-${w}`}>
              <line
                x1={x}
                y1={HEADER_H - 12}
                x2={x}
                y2={chartH - PAD}
                stroke="#eef2f4"
                strokeWidth={1}
              />
              {w < totalWeeks && (
                <text
                  x={x + WEEK_PX / 2}
                  y={HEADER_H - 16}
                  textAnchor="middle"
                  className="fill-[#9bb0bb]"
                  fontSize="9"
                  fontWeight={600}
                >
                  W{w + 1}
                </text>
              )}
            </g>
          );
        })}

        {/* Dependency arrows */}
        {tasks.map((t) =>
          t.dependsOn.map((depId) => {
            const di = indexById.get(depId);
            const dep = tasks.find((x) => x.id === depId);
            if (di === undefined || !dep) return null;
            const ti = indexById.get(t.id)!;
            const x1 = LABEL_W + (dep.startWeek + dep.durationWeeks) * WEEK_PX;
            const y1 = HEADER_H + di * ROW_H + ROW_H / 2;
            const x2 = LABEL_W + t.startWeek * WEEK_PX;
            const y2 = HEADER_H + ti * ROW_H + ROW_H / 2;
            const midX = Math.max(x1 + 8, x2 - 10);
            const d = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2 - 2} ${y2}`;
            return (
              <path
                key={`${t.id}-${depId}`}
                d={d}
                fill="none"
                stroke="#cbd6dc"
                strokeWidth={1.4}
                markerEnd="url(#arrow)"
              />
            );
          }),
        )}

        {/* Rows */}
        {tasks.map((t, i) => {
          const y = HEADER_H + i * ROW_H;
          const colors = TEAM_COLORS[t.team];
          const person = personById(t.assignedPersonId);
          const barX = LABEL_W + t.startWeek * WEEK_PX;
          const barW = Math.max(WEEK_PX * 0.6, t.durationWeeks * WEEK_PX - 6);
          const selected = selectedId === t.id;

          return (
            <g
              key={t.id}
              onClick={() => onSelect?.(t.id)}
              style={{ cursor: onSelect ? "pointer" : "default" }}
            >
              {selected && (
                <rect
                  x={0}
                  y={y}
                  width={chartW}
                  height={ROW_H}
                  fill="#f1fdf7"
                />
              )}
              {/* Label */}
              <rect x={0} y={y} width={6} height={ROW_H} fill={colors.bar} />
              <text
                x={16}
                y={y + ROW_H / 2 - 3}
                fontSize="12.5"
                fontWeight={700}
                className="fill-[#001942]"
              >
                {t.isHITL ? "🚩 " : ""}
                {truncate(t.name, 26)}
              </text>
              <text x={16} y={y + ROW_H / 2 + 13} fontSize="10" className="fill-[#6b7b85]">
                {t.agent !== "—" ? `${t.agent}` : "Human gate"}
                {person ? ` · ${person.name.split(" ")[0]}` : ""}
              </text>

              {/* Assignee avatar */}
              {person && (
                <>
                  <circle
                    cx={LABEL_W - 22}
                    cy={y + ROW_H / 2}
                    r={12}
                    fill={person.avatarColor}
                  />
                  <text
                    x={LABEL_W - 22}
                    y={y + ROW_H / 2 + 3.5}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight={700}
                    fill="#ffffff"
                  >
                    {initials(person.name)}
                  </text>
                </>
              )}

              {/* Bar */}
              <rect
                x={barX}
                y={y + 9}
                width={barW}
                height={ROW_H - 18}
                rx={9}
                fill={colors.bar}
                stroke={t.isHITL ? HITL_COLOR : "transparent"}
                strokeWidth={t.isHITL ? 2 : 0}
                strokeDasharray={t.isHITL ? "4 3" : undefined}
              />
              {/* Criticality dot */}
              <circle
                cx={barX + 12}
                cy={y + ROW_H / 2}
                r={3.5}
                fill={CRITICALITY_COLORS[t.criticality]}
              />
              <text
                x={barX + 22}
                y={y + ROW_H / 2 + 4}
                fontSize="10.5"
                fontWeight={600}
                fill={colors.text}
              >
                {truncate(t.phase, Math.max(3, Math.floor(barW / 8)))}
              </text>

              <title>
                {`${t.name}\nTeam: ${t.team} · ${t.criticality}\nAgent: ${t.agent}\n` +
                  `Weeks ${t.startWeek + 1}–${t.startWeek + t.durationWeeks}\n` +
                  (person ? `Owner: ${person.name} (${person.seniority})` : "Unassigned") +
                  (t.isHITL ? `\nHITL: ${t.hitlReason ?? "human review gate"}` : "")}
              </title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
