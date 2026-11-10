import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http as rest, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { server } from '../../../mocks/server';
import { ApiError } from '../../../shared/lib/http';
import type { TaskFilters } from './tasksApi';
import { useTasksQuery } from './useTasksQuery';

function setup(initialFilters: TaskFilters = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 60_000 } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const hook = renderHook(
    ({ filters }: { filters: TaskFilters }) => useTasksQuery(filters),
    { wrapper, initialProps: { filters: initialFilters } },
  );
  return { queryClient, ...hook };
}

describe('useTasksQuery', () => {
  it('loads the seed tasks and turns createdAt into a Date', async () => {
    const { result } = setup();
    expect(result.current.isPending).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(5);
    expect(result.current.data?.[0].createdAt).toBeInstanceOf(Date);
  });

  it('sends the status filter to the server', async () => {
    const { result } = setup({ status: 'done' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.every((t) => t.status === 'done')).toBe(true);
  });

  it('keeps a separate cache entry per filter', async () => {
    const { result, rerender, queryClient } = setup({});
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    rerender({ filters: { status: 'done' } });
    await waitFor(() => expect(result.current.data).toHaveLength(1));

    expect(queryClient.getQueryCache().findAll({ queryKey: ['tasks'] })).toHaveLength(2);
  });

  it('serves a fresh cached result without refetching', async () => {
    let requests = 0;
    server.use(
      rest.get('/api/tasks', () => {
        requests++;
        return HttpResponse.json([]);
      }),
    );

    const { result, rerender } = setup({});
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(requests).toBe(1);


    rerender({ filters: { status: 'done' } });
    await waitFor(() => expect(requests).toBe(2));


    rerender({ filters: {} });
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(requests).toBe(2);
  });

  it('exposes a server failure as an ApiError', async () => {
    server.use(
      rest.get('/api/tasks', () =>
        HttpResponse.json({ message: 'Boom' }, { status: 500 }),
      ),
    );

    const { result } = setup();
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
    expect(result.current.error).toMatchObject({ status: 500, message: 'Boom' });
  });


  it('skips a malformed item and still succeeds', async () => {
    server.use(rest.get('/api/tasks', () => HttpResponse.json([{ id: 'x' }])));
    const { result } = setup();
  
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
  
  it('reports an error when the payload is not a list', async () => {
    server.use(rest.get('/api/tasks', () => HttpResponse.json({ oops: true })));
    const { result } = setup();
  
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toMatch(/Invalid API response/);
  });
});