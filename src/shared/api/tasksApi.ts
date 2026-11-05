import type { Task, TaskChanges, TaskStatus, NewTaskInput } from '../../features/tasks/model';
import { http } from './http';
import { ZfetchTask, ZTask, type TaskDto, parseResponse } from "./schema";

export interface TaskFilters {
  status?: TaskStatus;
  q?: string;
}

export const toTask = (dto: TaskDto): Task => ({
  ...dto,
  createdAt: new Date(dto.createdAt),
});

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
  const dtos = await http.get<unknown>(buildTasksUrl(filters), signal);

  return parseResponse(ZfetchTask, dtos).map(toTask);
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
