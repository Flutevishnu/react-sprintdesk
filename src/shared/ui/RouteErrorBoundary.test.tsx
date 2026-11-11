import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { http as rest, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { server } from '../../mocks/server';
import { useTasksQuery } from '../../features/tasks/api/useTasksQuery';
import { RouteErrorBoundary } from './RouteErrorBoundary';

function TaskNames() {
  const { data } = useTasksQuery({}, { throwOnError: true });
  return (
    <ul>
      {data?.map((task) => (
        <li key={task.id}>{task.name}</li>
      ))}
    </ul>
  );
}

describe('RouteErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows a fallback on a server error and recovers when Retry is clicked', async () => {
    server.use(
      rest.get('/api/tasks', () =>
        HttpResponse.json({ message: 'Boom' }, { status: 500 }),
      ),
    );
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <RouteErrorBoundary>
          <TaskNames />
        </RouteErrorBoundary>
      </QueryClientProvider>,
    );

    expect(await screen.findByRole('alert')).toHaveTextContent('Boom');

    server.resetHandlers(); // the "server" is healthy again
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));

    expect(await screen.findByText('Set up project')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});