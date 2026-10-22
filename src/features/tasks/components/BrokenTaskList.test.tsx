import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { BrokenTaskList, type Task } from './BrokenTaskList';

function makeTasks(): Task[] {
  return [
    { id: '1', title: 'Write report', done: true, priority: 'high' },
    { id: '2', title: 'Review pull request', done: false, priority: 'medium' },
    { id: '3', title: 'Fix login bug', done: false, priority: 'low' },
  ];
}

describe('BrokenTaskList', () => {
  it('decreases the completed count when a done task is unticked', async () => {
    const user = userEvent.setup();
    render(<BrokenTaskList initialTasks={makeTasks()} />);

    expect(screen.getByText('1 of 3 completed')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Complete Write report'));

    expect(screen.getByText('0 of 3 completed')).toBeInTheDocument();
  });

  it('shows a task as ticked after it is toggled', async () => {
    const user = userEvent.setup();
    render(<BrokenTaskList initialTasks={makeTasks()} />);

    const checkbox = screen.getByLabelText('Complete Review pull request');
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);

    expect(screen.getByLabelText('Complete Review pull request')).toBeChecked();
  });

  it('removes a task from the list when it is deleted', async () => {
    const user = userEvent.setup();
    render(<BrokenTaskList initialTasks={makeTasks()} />);

    expect(screen.getByText('Fix login bug')).toBeInTheDocument();

    const row = screen.getByText('Fix login bug').closest('li') as HTMLElement;
    await user.click(within(row).getByRole('button', { name: 'Delete' }));

    expect(screen.queryByText('Fix login bug')).not.toBeInTheDocument();
  });

  it('keeps typed notes with the right task after another task is deleted', async () => {
    const user = userEvent.setup();
    render(<BrokenTaskList initialTasks={makeTasks()} />);

    await user.type(screen.getByLabelText('Notes for Review pull request'), 'check edge cases');

    const firstRow = screen.getByText('Write report').closest('li') as HTMLElement;
    await user.click(within(firstRow).getByRole('button', { name: 'Delete' }));

    expect(screen.getByLabelText('Notes for Review pull request')).toHaveValue('check edge cases');
    expect(screen.getByLabelText('Notes for Fix login bug')).toHaveValue('');
  });


  it('does not change the parent array when a task is added', async () => {
    const user = userEvent.setup();
    const initialTasks = makeTasks();
    render(<BrokenTaskList initialTasks={initialTasks} />);

    await user.type(screen.getByLabelText('New task'), 'Deploy app');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByText('Deploy app')).toBeInTheDocument();
    expect(initialTasks).toHaveLength(3);
  });

  it('adds a task to a frozen array without throwing', async () => {
    const user = userEvent.setup();
    const initialTasks = Object.freeze(makeTasks()) as Task[];
    render(<BrokenTaskList initialTasks={initialTasks} />);

    await user.type(screen.getByLabelText('New task'), 'Deploy app');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByText('Deploy app')).toBeInTheDocument();
    expect(screen.getByText('1 of 4 completed')).toBeInTheDocument();
    expect(screen.getByLabelText('New task')).toHaveValue('');
  });



  it('keeps a ticked task after sorting', async () => {
    const user = userEvent.setup();
    render(<BrokenTaskList initialTasks={makeTasks()} />);

    await user.click(screen.getByLabelText('Complete Fix login bug'));
    await user.click(screen.getByRole('button', { name: 'Sort by priority' }));

    expect(screen.getByLabelText('Complete Fix login bug')).toBeChecked();
  });

  it('keeps a deleted task deleted after sorting', async () => {
    const user = userEvent.setup();
    render(<BrokenTaskList initialTasks={makeTasks()} />);

    const row = screen.getByText('Write report').closest('li') as HTMLElement;
    await user.click(within(row).getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Sort by priority' }));

    expect(screen.queryByText('Write report')).not.toBeInTheDocument();
  });

  it('does not change the parent array when sorting', async () => {
    const user = userEvent.setup();
    const unsorted: Task[] = [
      { id: '1', title: 'Fix login bug', done: false, priority: 'low' },
      { id: '2', title: 'Write report', done: false, priority: 'high' },
      { id: '3', title: 'Review pull request', done: false, priority: 'medium' },
    ];
    const before = structuredClone(unsorted);
    render(<BrokenTaskList initialTasks={unsorted} />);

    await user.click(screen.getByRole('button', { name: 'Sort by priority' }));

    expect(unsorted).toEqual(before);
  });

  it('sorts a frozen array without throwing', async () => {
    const user = userEvent.setup();
    const frozen = Object.freeze([
      { id: '1', title: 'Fix login bug', done: false, priority: 'low' },
      { id: '2', title: 'Write report', done: false, priority: 'high' },
    ]) as Task[];
    render(<BrokenTaskList initialTasks={frozen} />);

    await user.click(screen.getByRole('button', { name: 'Sort by priority' }));

    const rows = screen.getAllByRole('listitem');
    expect(within(rows[0]).getByText('Write report')).toBeInTheDocument();
  });
});