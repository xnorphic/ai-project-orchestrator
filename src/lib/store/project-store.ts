"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ClarifyingQuestion,
  FeasibilityReport,
  PRD,
  Scenario,
  Step,
  Task,
  TimelineOption,
  TimelineOptionId,
} from "@/types";

interface ProjectStore {
  idea: string;
  prd: PRD | null;
  questions: ClarifyingQuestion[];
  answers: Record<string, string>;
  timelineOptions: TimelineOption[];
  selectedTimelineId: TimelineOptionId | null;
  sprintLengthWeeks: number;
  tasks: Task[];
  scenarios: Scenario[];
  report: FeasibilityReport | null;
  furthestStep: Step;

  setIdea: (idea: string) => void;
  setPrdAndQuestions: (prd: PRD, questions: ClarifyingQuestion[]) => void;
  setPrd: (prd: PRD) => void;
  setAnswer: (id: string, value: string) => void;
  setTimelineOptions: (options: TimelineOption[]) => void;
  selectTimeline: (id: TimelineOptionId) => void;
  setSprintLength: (weeks: number) => void;
  setTasks: (tasks: Task[]) => void;
  assignPerson: (taskId: string, personId: string | null) => void;
  setScenarios: (scenarios: Scenario[]) => void;
  setReport: (report: FeasibilityReport) => void;
  reach: (step: Step) => void;
  reset: () => void;
}

const STEP_ORDER: Step[] = [
  "idea",
  "prd",
  "timeline",
  "gantt",
  "scenarios",
  "report",
];

const initial = {
  idea: "",
  prd: null,
  questions: [],
  answers: {},
  timelineOptions: [],
  selectedTimelineId: null,
  sprintLengthWeeks: 2,
  tasks: [],
  scenarios: [],
  report: null,
  furthestStep: "idea" as Step,
};

export const useProject = create<ProjectStore>()(
  persist(
    (set, get) => ({
      ...initial,

      setIdea: (idea) => set({ idea }),
      setPrdAndQuestions: (prd, questions) =>
        set({ prd, questions, answers: {} }),
      setPrd: (prd) => set({ prd }),
      setAnswer: (id, value) =>
        set((s) => ({ answers: { ...s.answers, [id]: value } })),
      setTimelineOptions: (timelineOptions) => set({ timelineOptions }),
      selectTimeline: (id) => {
        const opt = get().timelineOptions.find((o) => o.id === id);
        set({
          selectedTimelineId: id,
          sprintLengthWeeks: opt?.sprintLengthWeeks ?? get().sprintLengthWeeks,
        });
      },
      setSprintLength: (sprintLengthWeeks) => set({ sprintLengthWeeks }),
      setTasks: (tasks) => set({ tasks }),
      assignPerson: (taskId, personId) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, assignedPersonId: personId } : t,
          ),
        })),
      setScenarios: (scenarios) => set({ scenarios }),
      setReport: (report) => set({ report }),
      reach: (step) =>
        set((s) => {
          const next = STEP_ORDER.indexOf(step);
          const cur = STEP_ORDER.indexOf(s.furthestStep);
          return next > cur ? { furthestStep: step } : {};
        }),
      reset: () => set({ ...initial }),
    }),
    { name: "apo-project" },
  ),
);

export { STEP_ORDER };
