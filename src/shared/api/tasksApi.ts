import type { Task, TaskChanges, TaskStatus, NewTaskInput } from '../../features/tasks/model';
import { http } from './http';
import type { TaskDto } from './types';

export interface TaskFilters {
  status?: TaskStatus;
  q?: string;
}

export type CreateTaskInput = NewTaskInput & {status? : TaskStatus}

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
  const dtos = await http.get<TaskDto[]>(buildTasksUrl(filters), signal);
  return dtos.map(toTask);
}

export async function createTask(input: CreateTaskInput) : Promise<Task> {
  const dto = await http.post<TaskDto>('/api/tasks', input);
  return toTask(dto);
}

export async function updateTask(id: number, changes: TaskChanges) : Promise<Task> {
  const dto = await http.patch<TaskDto>(`/api/tasks/${id}`, changes);
  return toTask(dto);
} 

export async function deleteTask(id: number): Promise<void> {
  await http.delete(`/api/tasks/${id}`);
}
