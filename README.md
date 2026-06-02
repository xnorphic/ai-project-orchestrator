# AI Project Orchestrator

**Live demo: https://ai-project-orchestrator-six.vercel.app**

An AI that turns a one-line idea into a **staffed, scenario-modelled delivery plan**.
It expands the idea into a PRD, asks clarifying questions, plans a timeline,
decomposes the work into tasks driven by AI sub-agents, assigns human owners
with human-in-the-loop gates at every critical juncture, models base /
optimistic / pessimistic delivery scenarios, and compiles a feasibility report
with a risk matrix and staffing-gap analysis.

Designed with a clean, bright, pastel take on the **Careem** brand palette and
typography (Plus Jakarta Sans + Inter, Careem green accents).

---

## The flow

| Step | What happens | Agent | Model |
| :--- | :--- | :--- | :--- |
| 1. Idea | Chat box — describe what you want to build | PRD Agent | Claude |
| 2. PRD | Expanded PRD + clarifying questions (with recommended answers) | PRD Agent | Claude |
| 3. Timeline | Recommended / Accelerated / Thorough options with explicit trade-offs | Timeline Agent | Claude |
| 4. Plan | Color-coded Gantt, AI sub-agents per task, human owners, HITL gates, staffing-gap detection | Task + Personnel Agents | Claude + GPT |
| 5. Scenarios | Base / Optimistic / Pessimistic, driven by velocity, scope, and a pricing→conversion chain | Scenario Agent | Claude |
| 6. Report | Feasibility score, risk matrix (cost / team / timeline / tech backlog), personnel gaps, recommendations | Report Agent | Claude |

Human-in-the-loop gates are highlighted in coral with dashed bars on the Gantt
and are always assigned the correct senior reviewer from the roster. When the
right person is not available, the gap is **not** a blocker — it is carried into
the feasibility report with its delivery risk (cost, team impact, timeline, or
tech backlog).

---

## Works with or without API keys

Every agent has a deterministic local engine behind it. With **no keys**, the
whole flow runs using these engines. Add keys to switch the generative steps
(PRD, timeline, tasks, personnel, scenarios, report) to live AI.

There are two ways to provide keys:

1. **In the app (recommended for the live demo)** — click **Add API keys** in
   the top bar and paste your Anthropic and/or OpenAI keys. They are stored only
   in your browser (localStorage) and sent only to this app's own routes, which
   forward them to the provider you chose. This is why the hosted demo needs no
   server secrets.
2. **Server env (local dev)** —

   ```bash
   cp .env.example .env.local   # then add keys if you have them
   ```

   - `ANTHROPIC_API_KEY` — enables Claude for reasoning steps
   - `OPENAI_API_KEY` — enables GPT for personnel matching

A key entered in the app takes priority over the server env var.

---

## Run it

```bash
npm install
npm run dev
# open http://localhost:3000
```

Click **Load the demo project** to jump straight into a fully populated
feature-launch plan (a Smart In-App Wallet & Tap-to-Pay project).

End-to-end API smoke test (server must be running):

```bash
node scripts/smoke.mjs
```

---

## Demo data

Two demo files exercise the whole system:

- [`src/lib/demo-data/feature-launch-project.ts`](src/lib/demo-data/feature-launch-project.ts)
  — a feature launch needing Product, Design, Engineering, DevOps, QA, and Business.
- [`src/lib/demo-data/personnel-list.ts`](src/lib/demo-data/personnel-list.ts)
  — the roster used for human-in-the-loop gates. Every role has a Junior, Mid,
  and Senior option; the choice trades off **speed, outcome quality, and cost**.
  Each person has current and past projects, which feed availability, backlog,
  and matching.

---

## Tech

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Vercel AI SDK v6** with `@ai-sdk/anthropic` and `@ai-sdk/openai`
- **Zustand** (persisted) for cross-step project state
- **Tailwind CSS v4** with a custom Careem-inspired pastel theme
- **Zod** schemas for every structured agent output
- Custom **SVG Gantt** with dependency arrows, sprint bands, and HITL markers

## Architecture notes

- Agent API routes live in [`src/app/api`](src/app/api); each tries its AI model
  and falls back to a deterministic engine in [`src/lib/logic`](src/lib/logic).
- Personnel matching ([`src/lib/logic/matching.ts`](src/lib/logic/matching.ts))
  scores candidates on skills, seniority fit, availability, and backlog, and
  reports gaps at critical / HITL gates.
- Scenario and report numbers are anchored on real computed cost and schedule so
  they stay truthful even when an AI writes the narrative.
