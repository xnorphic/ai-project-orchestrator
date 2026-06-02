const base = "http://localhost:3000";
const post = async (p, body) => {
  const r = await fetch(base + p, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`${p} -> ${r.status} ${await r.text()}`);
  return r.json();
};

const prdRes = await post("/api/prd", {
  idea: "A smart in-app wallet with tap to pay at partner merchants",
});
console.log("PRD:", prdRes.source, "|", prdRes.prd.title);

const tl = await post("/api/timeline", {
  prd: prdRes.prd,
  answers: {},
});
console.log("TIMELINE:", tl.source, "| options:", tl.options.map((o) => `${o.id}(${o.totalWeeks}w)`).join(", "));

const rec = tl.options.find((o) => o.recommended) ?? tl.options[0];
const tk = await post("/api/tasks", { prd: prdRes.prd, option: rec });
console.log("TASKS:", tk.source, "| count:", tk.tasks.length, "| HITL:", tk.tasks.filter((t) => t.isHITL).length);

const pp = await post("/api/personnel", { tasks: tk.tasks });
console.log("PERSONNEL:", pp.source, "| assigned:", Object.keys(pp.assignments).length, "| gaps:", pp.gaps.length);

const sc = await post("/api/scenarios", {
  prd: prdRes.prd,
  tasks: tk.tasks,
  option: rec,
  assignments: pp.assignments,
});
console.log("SCENARIOS:", sc.source, "|", sc.scenarios.map((s) => `${s.id}:${s.outcomes.deliveryWeeks}w/${s.outcomes.totalCostUsd}`).join("  "));

const rp = await post("/api/report", {
  prd: prdRes.prd,
  tasks: tk.tasks,
  option: rec,
  assignments: pp.assignments,
  scenarios: sc.scenarios,
});
console.log("REPORT:", rp.source, "| score:", rp.report.feasibilityScore, "| verdict:", rp.report.verdict, "| risks:", rp.report.risks.length, "| gaps:", rp.report.gaps.length);
console.log("\nAll endpoints OK ✓");
