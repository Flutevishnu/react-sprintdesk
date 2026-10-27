import { beforeEach, describe, expect, it } from 'vitest';
import type { Task } from './model';
import { loadTasks, saveTasks, TASKS_STORAGE_KEY } from './tasksStorage';

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
      name: 'Fix login bug',
      description: 'Users cannot sign in',
      status: 'done',
      priority: 'low',
      createdAt: new Date('2026-01-03T00:00:00Z'),
    },
  ];
}

describe('tasksStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns an empty list when nothing is saved', () => {
    expect(loadTasks()).toEqual([]);
  });

  it('loads tasks that were saved', () => {
    saveTasks(makeTasks());

    expect(loadTasks()).toEqual(makeTasks());
  });

  it('turns createdAt back into a Date', () => {
    saveTasks(makeTasks());

    const [first] = loadTasks();

    expect(first.createdAt).toBeInstanceOf(Date);
    expect(first.createdAt.getTime()).toBe(new Date('2026-01-01T00:00:00Z').getTime());
  });

  it('returns an empty list when the saved JSON is broken', () => {
    window.localStorage.setItem(TASKS_STORAGE_KEY, '{not valid json');

    expect(loadTasks()).toEqual([]);
  });

  it('returns an empty list when the saved value is not an array', () => {
    window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify({ id: 1 }));

    expect(loadTasks()).toEqual([]);
  });

  it('skips invalid items and keeps the valid ones', () => {
    const saved = [
      ...makeTasks(),
      { id: 'not a number', name: 'Bad id' },
      { id: 9, name: 'Bad status', status: 'finished', priority: 'low', createdAt: '2026-01-01' },
      'just a string',
    ];
    window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(saved));

    expect(loadTasks().map((task) => task.id)).toEqual([1, 2]);
  });
});