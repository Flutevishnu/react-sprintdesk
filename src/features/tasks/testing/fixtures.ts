import type { Task } from '../model/types';

export function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    name: 'Write report',
    description: 'Quarterly report',
    status: 'todo',
    priority: 'high',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

export function makeTasks(): Task[] {
  return [
    makeTask(),
    makeTask({
      id: 2,
      name: 'Review pull request',
      description: 'Check the new form',
      status: 'in_progress',
      priority: 'medium',
      createdAt: new Date('2026-01-02T00:00:00Z'),
    }),
    makeTask({
      id: 3,
      name: 'Fix login bug',
      description: 'Users cannot sign in',
      status: 'done',
      priority: 'low',
      createdAt: new Date('2026-01-03T00:00:00Z'),
    }),
  ];
}

export const newTask: Task = makeTask({
  id: 4,
  name: 'Deploy app',
  description: 'Deploy to staging',
  status: 'todo',
  priority: 'medium',
  createdAt: new Date('2026-01-04T00:00:00Z'),
});

