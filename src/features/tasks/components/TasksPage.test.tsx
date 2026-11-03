import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http as rest, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { server } from '../../../mocks/server';
import { TasksPage } from './TasksPage';

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

    const items = screen.getAllByRole('listitem');
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
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText('To do: 2')).toBeInTheDocument();
  });

  it('writes the filter to the URL when the user changes it', async () => {
    renderPage();
    await screen.findByText('Set up project');

    fireEvent.change(screen.getByLabelText('Filter by status'), {
      target: { value: 'done' },
    });

    expect(window.location.search).toBe('?status=done');
    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(1));
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

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Write docs' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }));

    expect(await screen.findByText('Write docs')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText('Title')).toHaveValue(''));
  });

  it('shows a validation message for a short title', async () => {
    renderPage();
    await screen.findByText('Set up project');

    fireEvent.click(screen.getByRole('button', { name: 'Add task' }));
    expect(screen.getByText('Title must be at least 3 characters')).toBeInTheDocument();
  });

  it('edits a task', async () => {
    renderPage();
    await screen.findByText('Set up project');

    fireEvent.click(screen.getByRole('button', { name: 'Edit Set up project' }));
    expect(screen.getByRole('heading', { name: 'Edit task' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Renamed task' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

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
});