import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Task } from '../tasks/model';
import { filterAndSortTasks, useTaskFilters, type TaskFilterOptions } from './usetaskfilters';

function makeTasks(): Task[] {
  return [
    {
      id: 1,
      name: 'Write report',
      description: 'Quarterly numbers',
      status: 'todo',
      priority: 'high',
      createdAt: new Date('2026-01-01T00:00:00Z'),
    },
    {
      id: 2,
      name: 'Review pull request',
      description: 'Check the new form',
      status: 'in_progress',
      priority: 'medium',
      createdAt: new Date('2026-01-02T00:00:00Z'),
    },
    {
      id: 3,
      name: 'Fix login bug',
      description: 'Users cannot sign in',
      status: 'done',
      priority: 'low',
      createdAt: new Date('2026-01-03T00:00:00Z'),
    },
    {
      id: 4,
      name: 'Deploy app',
      description: 'Ship to staging',
      status: 'todo',
      priority: 'high',
      createdAt: new Date('2026-01-04T00:00:00Z'),
    },
  ];
}

const defaults: TaskFilterOptions = {
  search: '',
  status: 'all',
  priority: 'all',
  sortBy: 'priority',
};

function ids(tasks: Task[]): number[] {
  return tasks.map((task) => task.id);
}

describe('filterAndSortTasks', () => {
  it('returns every task when no filter is set', () => {
    expect(filterAndSortTasks(makeTasks(), defaults)).toHaveLength(4);
  });

  it('filters by status', () => {
    const result = filterAndSortTasks(makeTasks(), { ...defaults, status: 'todo' });

    expect(ids(result)).toEqual([1, 4]);
  });

  it('filters by priority', () => {
    const result = filterAndSortTasks(makeTasks(), { ...defaults, priority: 'low' });

    expect(ids(result)).toEqual([3]);
  });

  it('searches the name, ignoring upper and lower case', () => {
    const result = filterAndSortTasks(makeTasks(), { ...defaults, search: 'REPORT' });

    expect(ids(result)).toEqual([1]);
  });

  it('searches the description', () => {
    const result = filterAndSortTasks(makeTasks(), { ...defaults, search: 'staging' });

    expect(ids(result)).toEqual([4]);
  });

  it('ignores spaces around the search text', () => {
    const result = filterAndSortTasks(makeTasks(), { ...defaults, search: '  report  ' });

    expect(ids(result)).toEqual([1]);
  });

  it('combines the status filter and the search', () => {
    const result = filterAndSortTasks(makeTasks(), {
      ...defaults,
      status: 'todo',
      search: 'deploy',
    });

    expect(ids(result)).toEqual([4]);
  });

  it('returns an empty list when nothing matches', () => {
    const result = filterAndSortTasks(makeTasks(), { ...defaults, search: 'zzz' });

    expect(result).toEqual([]);
  });

  it('sorts by priority, high first, keeping the original order for ties', () => {
    const result = filterAndSortTasks(makeTasks(), { ...defaults, sortBy: 'priority' });

    expect(ids(result)).toEqual([1, 4, 2, 3]);
  });

  it('sorts by date, newest first', () => {
    const result = filterAndSortTasks(makeTasks(), { ...defaults, sortBy: 'date' });

    expect(ids(result)).toEqual([4, 3, 2, 1]);
  });

  it('does not change the tasks it is given', () => {
    const tasks = makeTasks();
    const snapshot = structuredClone(tasks);

    filterAndSortTasks(tasks, { ...defaults, sortBy: 'date' });

    expect(tasks).toEqual(snapshot);
  });

  it('works on a frozen array', () => {
    const tasks = Object.freeze(makeTasks()) as Task[];

    expect(() => filterAndSortTasks(tasks, { ...defaults, sortBy: 'date' })).not.toThrow();
  });
});

describe('useTaskFilters', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with no filters, sorted by priority', () => {
    const { result } = renderHook(() => useTaskFilters(makeTasks()));

    expect(result.current.searchText).toBe('');
    expect(result.current.statusFilter).toBe('all');
    expect(result.current.priorityFilter).toBe('all');
    expect(result.current.sortBy).toBe('priority');
    expect(ids(result.current.visibleTasks)).toEqual([1, 4, 2, 3]);
  });

  it('updates the visible tasks when the status filter changes', () => {
    const { result } = renderHook(() => useTaskFilters(makeTasks()));

    act(() => {
      result.current.setStatusFilter('done');
    });

    expect(ids(result.current.visibleTasks)).toEqual([3]);
  });

  it('updates the visible tasks when the priority filter changes', () => {
    const { result } = renderHook(() => useTaskFilters(makeTasks()));

    act(() => {
      result.current.setPriorityFilter('high');
    });

    expect(ids(result.current.visibleTasks)).toEqual([1, 4]);
  });

  it('updates the order when the sort option changes', () => {
    const { result } = renderHook(() => useTaskFilters(makeTasks()));

    act(() => {
      result.current.setSortBy('date');
    });

    expect(ids(result.current.visibleTasks)).toEqual([4, 3, 2, 1]);
  });

  it('shows the typed text at once but filters only after the debounce delay', () => {
    const { result } = renderHook(() => useTaskFilters(makeTasks(), 300));

    act(() => {
      result.current.setSearchText('report');
    });

    // The input value updates immediately, the list does not.
    expect(result.current.searchText).toBe('report');
    expect(result.current.visibleTasks).toHaveLength(4);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(ids(result.current.visibleTasks)).toEqual([1]);
  });
});