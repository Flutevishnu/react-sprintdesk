import type { NewTaskDto, TaskDto, TaskPatchDto } from '../shared/api/types';

const seedTasks: TaskDto[] = [
  { id: 1, name: 'Set up project', description: 'Vite, React, TypeScript', status: 'done', priority: 'high', createdAt: '2026-10-01T09:00:00.000Z' },
  { id: 2, name: 'Design login page', description: 'Wireframe and styles', status: 'in_progress', priority: 'medium', createdAt: '2026-10-02T09:00:00.000Z', assignee: 'Asha' },
  { id: 3, name: 'Write API docs', description: 'Document the endpoints', status: 'todo', priority: 'low', createdAt: '2026-10-03T09:00:00.000Z' },
  { id: 4, name: 'Fix navbar bug', description: 'Menu does not close', status: 'in_progress', priority: 'high', createdAt: '2026-10-04T09:00:00.000Z', assignee: 'Ravi' },
  { id: 5, name: 'Plan sprint demo', description: 'Prepare the slides', status: 'todo', priority: 'medium', createdAt: '2026-10-05T09:00:00.000Z' },
];

let tasks: TaskDto[] = seedTasks.map((task) => ({ ...task }));
let nextId = seedTasks.length + 1;

export const db = {
  all: (): TaskDto[] => [...tasks],

  create: (input: NewTaskDto): TaskDto => {
    const task: TaskDto = {
      ...input,
      description: input.description ?? '',
      status: input.status ?? 'todo',
      priority: input.priority ?? 'medium',
      id: nextId++,
      createdAt: new Date().toISOString(),
    };
    tasks = [...tasks, task];
    return task;
  },

  update: (id: number, patch: TaskPatchDto): TaskDto | undefined => {
    const existing = tasks.find((task) => task.id === id);
    if (!existing) return undefined;
    const updated = { ...existing, ...patch };
    tasks = tasks.map((task) => (task.id === id ? updated : task));
    return updated;
  },

  remove: (id: number): boolean => {
    const before = tasks.length;
    tasks = tasks.filter((task) => task.id !== id);
    return tasks.length < before;
  },

  reset: (): void => {
    tasks = seedTasks.map((task) => ({ ...task }));
    nextId = seedTasks.length + 1;
  },
};