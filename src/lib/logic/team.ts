import type { Person, Task } from "@/types";
import { personById } from "@/lib/demo-data/personnel-list";

export interface ProjectTeamMember {
  person: Person;
  /** Tasks on this project assigned to the person. */
  taskCount: number;
  /** Human-in-the-loop gates the person owns. */
  hitlCount: number;
  /** Sum of the person's existing project load (0-1+). */
  backlogLoad: number;
  /** Existing commitments that compete for the person's time. */
  backlog: { name: string; load: number }[];
}

const SENIORITY_RANK: Record<string, number> = { Senior: 0, Mid: 1, Junior: 2 };

/**
 * Roll the task assignments up into the unique set of people who will work the
 * project, with their current designation and existing backlog.
 */
export function buildProjectTeam(tasks: Task[]): ProjectTeamMember[] {
  const byPerson = new Map<string, ProjectTeamMember>();

  for (const task of tasks) {
    const id = task.assignedPersonId;
    if (!id) continue;
    const person = personById(id);
    if (!person) continue;

    const existing = byPerson.get(id);
    if (existing) {
      existing.taskCount += 1;
      if (task.isHITL) existing.hitlCount += 1;
    } else {
      byPerson.set(id, {
        person,
        taskCount: 1,
        hitlCount: task.isHITL ? 1 : 0,
        backlogLoad: person.currentProjects.reduce((s, p) => s + p.load, 0),
        backlog: person.currentProjects,
      });
    }
  }

  return [...byPerson.values()].sort((a, b) => {
    if (a.person.team !== b.person.team)
      return a.person.team.localeCompare(b.person.team);
    return (
      (SENIORITY_RANK[a.person.seniority] ?? 9) -
      (SENIORITY_RANK[b.person.seniority] ?? 9)
    );
  });
}

export function backlogLabel(load: number): {
  label: string;
  tone: "light" | "moderate" | "heavy";
} {
  if (load >= 0.6) return { label: "Heavy", tone: "heavy" };
  if (load >= 0.3) return { label: "Moderate", tone: "moderate" };
  return { label: "Light", tone: "light" };
}
