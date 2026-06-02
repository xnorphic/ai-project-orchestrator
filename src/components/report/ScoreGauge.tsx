"use client";

export function ScoreGauge({ score }: { score: number }) {
  const r = 64;
  const c = Math.PI * r; // half-circle circumference
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const color =
    score >= 75 ? "#00b368" : score >= 55 ? "#0b9bb5" : score >= 35 ? "#f0a020" : "#fb6704";

  return (
    <div className="relative flex flex-col items-center">
      <svg width={168} height={104} viewBox="0 0 168 104">
        <path
          d="M 20 92 A 64 64 0 0 1 148 92"
          fill="none"
          stroke="#eef2f4"
          strokeWidth={14}
          strokeLinecap="round"
        />
        <path
          d="M 20 92 A 64 64 0 0 1 148 92"
          fill="none"
          stroke={color}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`}
        />
      </svg>
      <div className="absolute top-9 flex flex-col items-center">
        <span className="text-4xl font-extrabold" style={{ color }}>
          {score}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
          feasibility
        </span>
      </div>
    </div>
  );
}
