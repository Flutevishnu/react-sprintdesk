import { describe, expect, it } from 'vitest';
import type { Priority, Task } from './types';
import { viewTasks } from './viewTasks';

const make = (id: number, priority: Priority, day: number): Task => ({
  id,
  name: `Task ${id}`,
  status: 'todo',
  priority,
  createdAt: new Date(2026, 9, day),
});

const tasks = [make(1, 'low', 1), make(2, 'high', 2), make(3, 'medium', 3)];

describe('viewTasks', () => {
  it('sorts by priority, high first', () => {
    expect(viewTasks(tasks, { sort: 'priority' }).map((t) => t.id)).toEqual([2, 3, 1]);
  });

  it('sorts by date, newest first', () => {
    expect(viewTasks(tasks, { sort: 'date' }).map((t) => t.id)).toEqual([3, 2, 1]);
  });

  it('filters by priority', () => {
    expect(viewTasks(tasks, { priority: 'low', sort: 'date' }).map((t) => t.id)).toEqual([1]);
  });

  it('does not change the original array', () => {
    const copy = [...tasks];
    viewTasks(tasks, { sort: 'priority' });
    expect(tasks).toEqual(copy);
  });
});