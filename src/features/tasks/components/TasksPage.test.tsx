import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { http as rest, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { server } from '../../../mocks/server';
import { TasksPage } from './TasksPage';
import userEvent from '@testing-library/user-event';
import { RouteErrorBoundary } from '../../../shared/ui/RouteErrorBoundary';
function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <TasksPage />
    </QueryClientProvider>,
  );
}

beforeEach(() => window.history.replaceState(null, '', '/'));

describe('TasksPage', () => {
  it('shows the server tasks sorted by priority with counts for all tasks', async () => {
    renderPage();
    expect(await screen.findByText('Set up project')).toBeInTheDocument();

    const items = within(screen.getByRole('list', { name: 'Tasks' })).getAllByRole('listitem');
    expect(items).toHaveLength(5);
    expect(items[0]).toHaveTextContent('Set up project');
    expect(screen.getByText('To do: 2')).toBeInTheDocument();
    expect(screen.getByText('In progress: 2')).toBeInTheDocument();
    expect(screen.getByText('Done: 1')).toBeInTheDocument();
  });

  it('applies the status filter from the URL but keeps counts for all tasks', async () => {
    window.history.replaceState(null, '', '/?status=done');
    renderPage();

    expect(await screen.findByText('Set up project')).toBeInTheDocument();
    expect(within(screen.getByRole('list', { name: 'Tasks' })).getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText('To do: 2')).toBeInTheDocument();
  });

  it('writes the filter to the URL when the user changes it', async () => {
    renderPage();
    await screen.findByText('Set up project');

    fireEvent.change(screen.getByLabelText('Filter by status'), {
      target: { value: 'done' },
    });

    expect(window.location.search).toBe('?status=done');
    await waitFor(() => expect(within(screen.getByRole('list', { name: 'Tasks' })).getAllByRole('listitem')).toHaveLength(1));
  });

  it('shows a "no matches" state when filters match nothing', async () => {
    window.history.replaceState(null, '', '/?q=zzzz');
    renderPage();
    expect(await screen.findByText('No tasks match your filters')).toBeInTheDocument();
  });

  it('shows an empty state when the server has no tasks', async () => {
    server.use(rest.get('/api/tasks', () => HttpResponse.json([])));
    renderPage();
    expect(await screen.findByText(/No tasks yet/)).toBeInTheDocument();
  });

  it('creates a task, shows it, and clears the form', async () => {
    renderPage();
    await screen.findByText('Set up project');


    const user = userEvent.setup()
    await user.type(screen.getByLabelText("Title"), "Write docs");
    await user.click(screen.getByRole('button', {name: 'Add task'}));


    expect(await screen.findByText('Write docs')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText('Title')).toHaveValue(''));
  });

  it('shows a validation message for a short title', async () => {
    const user = userEvent.setup()
    renderPage();
    await screen.findByText('Set up project');

    await user.click(screen.getByRole('button', { name: 'Add task' }));
    expect(await screen.findByText('Title must be at least 3 characters')).toBeInTheDocument();
  });

  it('edits a task', async () => {
    renderPage();
    await screen.findByText('Set up project');

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Edit Set up project' }));
    expect(screen.getByRole('heading', { name: 'Edit task' })).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Title'));
    await user.type(screen.getByLabelText('Title'), 'Renamed task');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Renamed task')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Add a task' })).toBeInTheDocument();
  });

  it('deletes a task', async () => {
    renderPage();
    await screen.findByText('Set up project');

    fireEvent.click(screen.getByRole('button', { name: 'Delete Set up project' }));
    await waitFor(() =>
      expect(screen.queryByText('Set up project')).not.toBeInTheDocument(),
    );
  });

  it('shows a server field error next to the Title input', async () => {
    const user = userEvent.setup();
    server.use(
      rest.post('/api/tasks', () =>
        HttpResponse.json(
          { message: 'Validation failed', errors: { name: 'Some Error' } },
          { status: 400 },
        ),
      ),
    );
    renderPage();
    await screen.findByText('Set up project');
  
    await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Set up project');
    await user.click(screen.getByRole('button', { name: 'Add task' }));
  
    const message = await screen.findByText('Some Error');
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveAccessibleDescription(
      'Some Error',
    );
    expect(message).toBeInTheDocument();
  });


  it('still shows valid tasks when the server sends a malformed one', async () => {
    server.use(
      rest.get('/api/tasks', () =>
        HttpResponse.json([
          { id: 1, name: 'Valid task', status: 'todo', priority: 'low', createdAt: '2026-10-01T09:00:00.000Z' },
          { id: 2, name: 123 },
        ]),
      ),
    );
    renderPage();
  
    expect(await screen.findByText('Valid task')).toBeInTheDocument();
    expect(within(screen.getByRole('list', { name: 'Tasks' })).getAllByRole('listitem')).toHaveLength(1);
  });

  it('shows each task once when the server sends duplicate ids', async () => {
    const task = { id: 1, name: 'Only once', status: 'todo', priority: 'low', createdAt: '2026-10-01T09:00:00.000Z' };
    server.use(rest.get('/api/tasks', () => HttpResponse.json([task, task])));
    renderPage();
  
    expect(await screen.findByText('Only once')).toBeInTheDocument();
    expect(within(screen.getByRole('list', { name: 'Tasks' })).getAllByRole('listitem')).toHaveLength(1);
  });

  it('shows the error fallback when the payload is not a list', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    server.use(rest.get('/api/tasks', () => HttpResponse.json({ oops: true })));
  
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <RouteErrorBoundary>
          <TasksPage />
        </RouteErrorBoundary>
      </QueryClientProvider>,
    );
  
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid API response');
  });
});