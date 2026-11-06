import type { Task, TaskChanges, TaskStatus, NewTaskInput } from '../../features/tasks/model';
import { http } from './http';
import { ZfetchTask, ZTask, type TaskDto, parseResponse } from "./schema";

export interface TaskFilters {
  status?: TaskStatus;
  q?: string;
}

export interface ParsedTasks {
  tasks: Task[];
  skipped: number;
}


export const toTask = (dto: TaskDto): Task => ({
  ...dto,
  createdAt: new Date(dto.createdAt),
});

export function parseTasks(data: unknown): ParsedTasks {
  if (!Array.isArray(data)) {
    throw new Error('Invalid API response: expected a list of tasks');
  }

  const seen = new Set<number>();
  const tasks: Task[] = [];
  let skipped = 0;

  for (const item of data) {
    const result = ZTask.safeParse(item);
    if (!result.success || seen.has(result.data.id)) {
      skipped++;
      continue;
    }
    seen.add(result.data.id);
    tasks.push(toTask(result.data));
  }

  return { tasks, skipped };
}


export function buildTasksUrl(filters: TaskFilters): string {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.q) params.set('q', filters.q);
  const query = params.toString();
  return query ? `/api/tasks?${query}` : '/api/tasks';
}

export async function fetchTasks(
  filters: TaskFilters,
  signal?: AbortSignal,
): Promise<Task[]> {
  const data = await http.get<unknown>(buildTasksUrl(filters), signal);
  const { tasks, skipped } = parseTasks(data);

  if (skipped > 0) {
    console.warn(`[api] skipped ${skipped} invalid or duplicate task`);
  }
  return tasks
}

export async function createTask(input: NewTaskInput) : Promise<Task> {
  const dto = await http.post<unknown>('/api/tasks', input);

  return toTask(parseResponse(ZTask, dto))
}

export async function updateTask(id: number, changes: TaskChanges) : Promise<Task> {
  const dto = await http.patch<unknown>(`/api/tasks/${id}`, changes);

  return toTask(parseResponse(ZTask, dto))
} 

export async function deleteTask(id: number): Promise<void> {
  await http.delete(`/api/tasks/${id}`);
}
