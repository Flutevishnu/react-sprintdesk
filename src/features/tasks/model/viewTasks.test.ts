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


  it('keeps the original order for tasks with the same priority', () => {
    const input = [make(1, 'high', 1), make(2, 'low', 2), make(3, 'high', 3)];

    expect(viewTasks(input, { sort: 'priority' }).map((t) => t.id)).toEqual([1, 3, 2]);
  });

  it('works on a frozen array', () => {
    const frozen = Object.freeze([...tasks]);

    expect(() => viewTasks(frozen, { sort: 'date' })).not.toThrow();
  });

  it('returns an empty list when no task has the chosen priority', () => {
    const input = [make(1, 'low', 1), make(2, 'medium', 2)];

    expect(viewTasks(input, { priority: 'high', sort: 'date' })).toEqual([]);
  });

  it('applies the priority filter before sorting', () => {
    const input = [make(1, 'high', 1), make(2, 'low', 2), make(3, 'high', 3)];

    expect(
      viewTasks(input, { priority: 'high', sort: 'date' }).map((t) => t.id),
    ).toEqual([3, 1]);
  });
});