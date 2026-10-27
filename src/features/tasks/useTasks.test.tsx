import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Task } from './model';
import { TasksProvider } from './TasksProvider';
import { useTasks, useTasksDispatch } from './useTasks';

function makeTasks(): Task[] {
  return [
    {
      id: 1,
      name: 'Write report',
      description: 'Quarterly report',
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
  ];
}

function createWrapper(initialTasks?: Task[]) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <TasksProvider initialTasks={initialTasks}>{children}</TasksProvider>;
  };
}

describe('outside a TasksProvider', () => {

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('useTasks throws a helpful error', () => {
    expect(() => renderHook(() => useTasks())).toThrow(
      'useTasks must be used inside a <TasksProvider>',
    );
  });

  it('useTasksDispatch throws a helpful error', () => {
    expect(() => renderHook(() => useTasksDispatch())).toThrow(
      'useTasksDispatch must be used inside a <TasksProvider>',
    );
  });
});

describe('inside a TasksProvider', () => {
  it('starts with an empty list by default', () => {
    const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() });

    expect(result.current).toEqual([]);
  });

  it('starts with the initial tasks', () => {
    const { result } = renderHook(() => useTasks(), {
      wrapper: createWrapper(makeTasks()),
    });

    expect(result.current).toEqual(makeTasks());
  });

  it('updates the tasks when an action is dispatched', () => {
    const { result } = renderHook(
      () => ({ tasks: useTasks(), dispatch: useTasksDispatch() }),
      { wrapper: createWrapper(makeTasks()) },
    );

    act(() => {
      result.current.dispatch({ type: 'deleted', id: 1 });
    });

    expect(result.current.tasks.map((task) => task.id)).toEqual([2]);
  });

  it('applies several actions in order', () => {
    const { result } = renderHook(
      () => ({ tasks: useTasks(), dispatch: useTasksDispatch() }),
      { wrapper: createWrapper(makeTasks()) },
    );

    act(() => {
      result.current.dispatch({ type: 'toggled', id: 1 });
      result.current.dispatch({ type: 'status_moved', id: 2, status: 'done' });
    });

    expect(result.current.tasks.map((task) => task.status)).toEqual(['done', 'done']);
  });
});