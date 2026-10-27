import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Task } from '../model';
import { TasksProvider } from '../TasksProvider';
import { TaskListView } from './TaskListView';

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

function renderView(tasks: Task[] = makeTasks()) {
  return render(
    <TasksProvider initialTasks={tasks}>
      <TaskListView />
    </TasksProvider>,
  );
}

function counts() {
  return within(screen.getByRole('list', { name: 'Task counts' }));
}

function rows() {
  return within(screen.getByRole('list', { name: 'Tasks' })).getAllByRole('listitem');
}

describe('TaskListView', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('list and counts', () => {
    it('shows every task, sorted by priority at the start', () => {
      renderView();

      const items = rows();
      expect(items).toHaveLength(4);
      expect(items[0]).toHaveTextContent('Write report');
      expect(items[1]).toHaveTextContent('Deploy app');
      expect(items[2]).toHaveTextContent('Review pull request');
      expect(items[3]).toHaveTextContent('Fix login bug');
    });

    it('shows the count for each status', () => {
      renderView();

      expect(counts().getByText('To do: 2')).toBeInTheDocument();
      expect(counts().getByText('In progress: 1')).toBeInTheDocument();
      expect(counts().getByText('Done: 1')).toBeInTheDocument();
    });
  });

  describe('empty states', () => {
    it('shows "No tasks yet" when there are no tasks', () => {
      renderView([]);

      expect(screen.getByText('No tasks yet')).toBeInTheDocument();
    });

    it('shows "No tasks match your filters" when nothing matches', async () => {
      const user = userEvent.setup();
      renderView();

      await user.type(screen.getByLabelText('Search tasks'), 'zzz');

      expect(await screen.findByText('No tasks match your filters')).toBeInTheDocument();
      expect(screen.queryByText('No tasks yet')).not.toBeInTheDocument();
    });
  });

  describe('filters, search and sort', () => {
    it('filters by status', async () => {
      const user = userEvent.setup();
      renderView();

      await user.selectOptions(screen.getByLabelText('Filter by status'), 'done');

      expect(rows()).toHaveLength(1);
      expect(rows()[0]).toHaveTextContent('Fix login bug');
    });

    it('filters by priority', async () => {
      const user = userEvent.setup();
      renderView();

      await user.selectOptions(screen.getByLabelText('Filter by priority'), 'medium');

      expect(rows()).toHaveLength(1);
      expect(rows()[0]).toHaveTextContent('Review pull request');
    });

    it('filters by the search text after the debounce delay', async () => {
      const user = userEvent.setup();
      renderView();

      await user.type(screen.getByLabelText('Search tasks'), 'report');

      await waitFor(() => expect(rows()).toHaveLength(1));
      expect(rows()[0]).toHaveTextContent('Write report');
    });

    it('keeps the counts for all tasks while a filter is on', async () => {
      const user = userEvent.setup();
      renderView();

      await user.selectOptions(screen.getByLabelText('Filter by status'), 'done');

      expect(counts().getByText('To do: 2')).toBeInTheDocument();
      expect(counts().getByText('Done: 1')).toBeInTheDocument();
    });

    it('sorts by date, newest first', async () => {
      const user = userEvent.setup();
      renderView();

      await user.selectOptions(screen.getByLabelText('Sort by'), 'date');

      const items = rows();
      expect(items[0]).toHaveTextContent('Deploy app');
      expect(items[1]).toHaveTextContent('Fix login bug');
      expect(items[2]).toHaveTextContent('Review pull request');
      expect(items[3]).toHaveTextContent('Write report');
    });
  });

  describe('create, edit, delete and status', () => {
    it('adds a new task from the form', async () => {
      const user = userEvent.setup();
      renderView();

      await user.type(screen.getByLabelText('Title'), 'Update the docs');
      await user.click(screen.getByRole('button', { name: 'Add task' }));

      expect(screen.getByText('Update the docs')).toBeInTheDocument();
      expect(counts().getByText('To do: 3')).toBeInTheDocument();
      expect(screen.getByLabelText('Title')).toHaveValue('');
    });

    it('edits a task and goes back to create mode', async () => {
      const user = userEvent.setup();
      renderView();

      await user.click(screen.getByRole('button', { name: 'Edit Write report' }));

      expect(screen.getByRole('heading', { name: 'Edit task' })).toBeInTheDocument();
      expect(screen.getByLabelText('Title')).toHaveValue('Write report');

      await user.clear(screen.getByLabelText('Title'));
      await user.type(screen.getByLabelText('Title'), 'Write the final report');
      await user.click(screen.getByRole('button', { name: 'Save changes' }));

      expect(screen.getByText('Write the final report')).toBeInTheDocument();
      expect(screen.queryByText('Write report')).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Add a task' })).toBeInTheDocument();
    });

    it('shows the values of the right task when editing a different one', async () => {
      const user = userEvent.setup();
      renderView();

      await user.click(screen.getByRole('button', { name: 'Edit Write report' }));
      await user.click(screen.getByRole('button', { name: 'Edit Fix login bug' }));

      expect(screen.getByLabelText('Title')).toHaveValue('Fix login bug');
    });

    it('goes back to create mode when Cancel is clicked', async () => {
      const user = userEvent.setup();
      renderView();

      await user.click(screen.getByRole('button', { name: 'Edit Write report' }));
      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(screen.getByRole('heading', { name: 'Add a task' })).toBeInTheDocument();
      expect(screen.getByLabelText('Title')).toHaveValue('');
    });

    it('deletes a task', async () => {
      const user = userEvent.setup();
      renderView();

      await user.click(screen.getByRole('button', { name: 'Delete Fix login bug' }));

      expect(screen.queryByText('Fix login bug')).not.toBeInTheDocument();
      expect(counts().getByText('Done: 0')).toBeInTheDocument();
    });

    it('changes the status of a task', async () => {
      const user = userEvent.setup();
      renderView();

      await user.selectOptions(screen.getByLabelText('Status of Write report'), 'done');

      expect(counts().getByText('To do: 1')).toBeInTheDocument();
      expect(counts().getByText('Done: 2')).toBeInTheDocument();
    });
  });
});