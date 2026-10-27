import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Task } from './model';
import { TasksProvider } from './TasksProvider';
import { TASKS_STORAGE_KEY, saveTasks } from './tasksStorage';
import { useTasks, useTasksDispatch } from './useTasks';

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
  ];
}

const newTask: Task = {
  id: 2,
  name: 'Deploy app',
  description: 'Ship to staging',
  status: 'todo',
  priority: 'medium',
  createdAt: new Date('2026-01-04T00:00:00Z'),
};

function Wrapper({ children }: { children: ReactNode }) {
  return <TasksProvider>{children}</TasksProvider>;
}

function useBoth() {
  return { tasks: useTasks(), dispatch: useTasksDispatch() };
}

describe('TasksProvider persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with the tasks saved in localStorage', () => {
    saveTasks(makeTasks());

    const { result } = renderHook(() => useTasks(), { wrapper: Wrapper });

    expect(result.current).toEqual(makeTasks());
  });

  it('starts empty when nothing is saved', () => {
    const { result } = renderHook(() => useTasks(), { wrapper: Wrapper });

    expect(result.current).toEqual([]);
  });

  it('saves the tasks after they change', () => {
    const { result } = renderHook(useBoth, { wrapper: Wrapper });

    act(() => {
      result.current.dispatch({ type: 'added', task: newTask });
    });

    const saved = JSON.parse(window.localStorage.getItem(TASKS_STORAGE_KEY) ?? '[]');
    expect(saved).toHaveLength(1);
    expect(saved[0].name).toBe('Deploy app');
  });

  it('writes to storage once on mount and once per change', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const { result } = renderHook(useBoth, { wrapper: Wrapper });

    expect(setItem).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.dispatch({ type: 'added', task: newTask });
    });

    expect(setItem).toHaveBeenCalledTimes(2);
  });

  it('keeps the tasks when the provider is mounted again', () => {
    const first = renderHook(useBoth, { wrapper: Wrapper });
    act(() => {
      first.result.current.dispatch({ type: 'added', task: newTask });
    });
    first.unmount();

    const second = renderHook(() => useTasks(), { wrapper: Wrapper });

    expect(second.result.current).toEqual([newTask]);
    expect(second.result.current[0].createdAt).toBeInstanceOf(Date);
  });

  it('uses the initialTasks prop instead of the saved tasks', () => {
    saveTasks(makeTasks());

    const { result } = renderHook(() => useTasks(), {
      wrapper: ({ children }) => <TasksProvider initialTasks={[newTask]}>{children}</TasksProvider>,
    });

    expect(result.current).toEqual([newTask]);
  });
});