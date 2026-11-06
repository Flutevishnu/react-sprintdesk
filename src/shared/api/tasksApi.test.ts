import { describe, expect, it } from 'vitest';
import { parseTasks } from './tasksApi';

const good = (id: number) => ({
  id,
  name: `Task ${id}`,
  status: 'todo',
  priority: 'low',
  createdAt: '2026-10-01T09:00:00.000Z',
});

describe('parseTasks', () => {
  it('keeps valid tasks and skips malformed ones', () => {
    const result = parseTasks([good(1), { id: 'x' }, good(2), null]);
    expect(result.tasks.map((t) => t.id)).toEqual([1, 2]);
    expect(result.skipped).toBe(2);
  });

  it('keeps the first task when ids are duplicated', () => {
    const result = parseTasks([good(1), { ...good(1), name: 'Duplicate' }, good(2)]);
    expect(result.tasks.map((t) => t.name)).toEqual(['Task 1', 'Task 2']);
    expect(result.skipped).toBe(1);
  });

  it('returns an empty result for an empty array', () => {
    expect(parseTasks([])).toEqual({ tasks: [], skipped: 0 });
  });

  it('throws a clear error when the payload is not an array', () => {
    expect(() => parseTasks({ tasks: [] })).toThrow('Invalid API response');
    expect(() => parseTasks(null)).toThrow('Invalid API response');
  });

  it('rejects an invalid date', () => {
    const result = parseTasks([{ ...good(1), createdAt: 'banana' }]);
    expect(result.tasks).toEqual([]);
    expect(result.skipped).toBe(1);
  });
});