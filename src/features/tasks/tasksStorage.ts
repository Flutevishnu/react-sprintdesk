import type { Priority, Task, TaskStatus } from './model';

export const TASKS_STORAGE_KEY = 'sprintdesk.tasks';

const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done'];
const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

function parseTask(value: unknown): Task | null {
  if (typeof value !== 'object' || value === null) return null;
  const raw = value as Record<string, unknown>;
  const createdAt = new Date(String(raw.createdAt));

  if (
    typeof raw.id !== 'number' ||
    typeof raw.name !== 'string' ||
    !STATUSES.includes(raw.status as TaskStatus) ||
    !PRIORITIES.includes(raw.priority as Priority) ||
    Number.isNaN(createdAt.getTime())
  ) {
    return null;
  }

  return {
    id: raw.id,
    name: raw.name,
    description: typeof raw.description === 'string' ? raw.description : '',
    status: raw.status as TaskStatus,
    priority: raw.priority as Priority,
    createdAt,
  };
}


export function loadTasks(): Task[] {
  try {
    const stored = window.localStorage.getItem(TASKS_STORAGE_KEY);
    if (stored === null) return [];

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed.map(parseTask).filter((task): task is Task => task !== null);
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}