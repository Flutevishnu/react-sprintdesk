import type { TaskChanges, NewTaskInput } from '../features/tasks/model/types';
import { type TaskDto, ZfetchTask } from "../features/tasks/api/schema"
import { seedTasks as largeSeed } from "./seedTasks"
import * as z from 'zod';
import { type TaskStatus } from '../features/tasks/model/types';
const KEY = 'sprintdesk.mock-db';

const smallSeed: TaskDto[] = [
  { id: 1, name: 'Set up project', description: 'Vite, React, TypeScript', status: 'done', priority: 'high', createdAt: '2026-10-01T09:00:00.000Z' },
  { id: 2, name: 'Design login page', description: 'Wireframe and styles', status: 'in_progress', priority: 'medium', createdAt: '2026-10-02T09:00:00.000Z', assignee: 'Asha' },
  { id: 3, name: 'Write API docs', description: 'Document the endpoints', status: 'todo', priority: 'low', createdAt: '2026-10-03T09:00:00.000Z' },
  { id: 4, name: 'Fix navbar bug', description: 'Menu does not close', status: 'in_progress', priority: 'high', createdAt: '2026-10-04T09:00:00.000Z', assignee: 'Ravi' },
  { id: 5, name: 'Plan sprint demo', description: 'Prepare the slides', status: 'todo', priority: 'medium', createdAt: '2026-10-05T09:00:00.000Z' },
];


const storedSchema = z.object({ tasks: ZfetchTask, nextId: z.number() });
type State = z.infer<typeof storedSchema>;

type CreateInput = NewTaskInput & { status?: TaskStatus };


export function createDb(storage: Storage | null, initial: readonly TaskDto[]) {

  const fresh = (): State => ({
    tasks: initial.map((task) => ({ ...task })),
    nextId: Math.max(0, ...initial.map((task) => task.id)) + 1,
  });

  function load(): State {
    if (!storage) return fresh();
    try {
      const raw = storage.getItem(KEY);
      if (raw) {
        const parsed = storedSchema.safeParse(JSON.parse(raw));
        if (parsed.success) return parsed.data;
      }
    } catch {
      // unreadable storage: start from the seed
    }
    return fresh();
  }

  let state = load();

  function save() {
    try {
      storage?.setItem(KEY, JSON.stringify(state));
    } catch {
      // storage full or blocked: keep working in memory
    }
  }

  return {
    all: (): TaskDto[] => [...state.tasks],

    create: (input: CreateInput): TaskDto => {
      const task: TaskDto = {
        ...input,
        description: input.description ?? '',
        status: input.status ?? 'todo',
        priority: input.priority ?? 'medium',
        id: state.nextId,
        createdAt: new Date().toISOString(),
      };
      state = { tasks: [...state.tasks, task], nextId: state.nextId + 1 };
      save();
      return task;
    },

    update: (id: number, patch: TaskChanges): TaskDto | undefined => {
      const existing = state.tasks.find((task) => task.id === id);
      if (!existing) return undefined;
      const updated = { ...existing, ...patch };
      state = { ...state, tasks: state.tasks.map((task) => (task.id === id ? updated : task)) };
      save();
      return updated;
    },

    remove: (id: number): boolean => {
      const before = state.tasks.length;
      state = { ...state, tasks: state.tasks.filter((task) => task.id !== id) };
      save();
      return state.tasks.length < before;
    },

    reset: (): void => {
      storage?.removeItem(KEY);
      state = fresh();
    },

  }
}

const inTest = import.meta.env.MODE === 'test';
export const db = createDb(inTest ? null : window.localStorage, inTest ? smallSeed : largeSeed);
