import type { Task, TaskChanges } from '../../features/tasks/model';


export type TaskDto = Omit<Task, 'createdAt'> & { createdAt: string };
export type NewTaskDto = Omit<TaskDto, 'id' | 'createdAt'>;
export type TaskPatchDto = TaskChanges;
