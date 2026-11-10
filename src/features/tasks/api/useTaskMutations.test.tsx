import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { delay, http as rest, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { db } from '../../../mocks/db';
import { server } from '../../../mocks/server';
import {
  useCreateTask,
  useDeleteTask,
  useMoveTaskStatus,
  useUpdateTask,
} from './useTaskMutations';
import { useTasksQuery } from './useTasksQuery';
import type { TaskChanges } from '../model/types';

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 60_000 },
      mutations: { retry: false },
    },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(
    () => ({
      tasks: useTasksQuery({}),
      create: useCreateTask(),
      update: useUpdateTask(),
      remove: useDeleteTask(),
      move: useMoveTaskStatus(),
    }),
    { wrapper },
  );
}

type Hook = ReturnType<typeof setup>;
const statusOf = (hook: Hook, id: number) =>
  hook.result.current.tasks.data?.find((t) => t.id === id)?.status;

async function loaded() {
  const hook = setup();
  await waitFor(() => expect(hook.result.current.tasks.isSuccess).toBe(true));
  return hook;
}

describe('task mutations', () => {
  it('create adds a task and the list refetches', async () => {
    const hook = await loaded();
    act(() => hook.result.current.create.mutate({ name: 'New task', priority: 'low', status: "todo" }));
    await waitFor(() => expect(hook.result.current.tasks.data).toHaveLength(6));
  });

  it('delete removes the task from the list', async () => {
    const hook = await loaded();
    act(() => hook.result.current.remove.mutate(1));
    await waitFor(() => expect(hook.result.current.tasks.data).toHaveLength(4));
  });

  it('update changes the task name', async () => {
    const hook = await loaded();
    act(() => hook.result.current.update.mutate({ id: 1, changes: { name: 'Renamed' } }));
    await waitFor(() =>
      expect(hook.result.current.tasks.data?.find((t) => t.id === 1)?.name).toBe('Renamed'),
    );
  });

  it('isPending is true while a mutation is running', async () => {
    server.use(
      rest.post('/api/tasks', async () => {
        await delay(200);
        return HttpResponse.json({ message: 'x' }, { status: 400 });
      }),
    );
    const hook = await loaded();
    act(() => hook.result.current.create.mutate({ name: 'A', priority: 'low', status: "todo" }));
    await waitFor(() => expect(hook.result.current.create.isPending).toBe(true));
    await waitFor(() => expect(hook.result.current.create.isError).toBe(true));
  });

  it('status change is optimistic: the UI updates before the server answers', async () => {
    server.use(
      rest.patch('/api/tasks/:id', async ({ request, params }) => {
        const patch = (await request.json()) as TaskChanges;
        await delay(300);
        return HttpResponse.json(db.update(Number(params.id), patch));
      }),
    );
    const hook = await loaded();
    expect(statusOf(hook, 3)).toBe('todo');

    act(() => hook.result.current.move.mutate({ id: 3, status: 'in_progress' }));

    await waitFor(() => expect(statusOf(hook, 3)).toBe('in_progress'));
    expect(hook.result.current.move.isPending).toBe(true); 

    await waitFor(() => expect(hook.result.current.move.isSuccess).toBe(true));
    await waitFor(() => expect(statusOf(hook, 3)).toBe('in_progress'));
  });

  it('rolls back when the server fails', async () => {
    server.use(
      rest.patch('/api/tasks/:id', async () => {
        await delay(200);
        return HttpResponse.json({ message: 'Boom' }, { status: 500 });
      }),
    );
    const hook = await loaded();

    act(() => hook.result.current.move.mutate({ id: 3, status: 'in_progress' }));

    await waitFor(() => expect(statusOf(hook, 3)).toBe('in_progress')); 
    await waitFor(() => expect(hook.result.current.move.isError).toBe(true));
    await waitFor(() => expect(statusOf(hook, 3)).toBe('todo')); 
  });
});