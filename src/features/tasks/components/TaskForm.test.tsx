import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TaskForm } from './TaskForm';
import { makeTask as buildTask } from '../testing/fixtures';

const makeTask = () => buildTask({ status: 'in_progress' });

describe('TaskForm: create mode', () => {
  it('starts empty with default priority and status', () => {
    render(<TaskForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('Task Title (required)')).toHaveValue('');
    expect(screen.getByLabelText('Description')).toHaveValue('');
    expect(screen.getByLabelText('Priority')).toHaveValue('medium');
    expect(screen.getByLabelText('Status')).toHaveValue('todo');
    expect(screen.getByRole('button', { name: 'Add task' })).toBeInTheDocument();
  });

  it('shows no error before the user has touched anything', () => {
    render(<TaskForm onSubmit={vi.fn()} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows an error on blur when the title is shorter than 3 characters', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText('Task Title (required)'), 'ab');
    await user.tab();

    expect(screen.getByRole('alert')).toHaveTextContent('at least 3 characters');
    expect(screen.getByLabelText('Task Title (required)')).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows an error when the title is longer than 100 characters', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={vi.fn()} />);

    await user.click(screen.getByLabelText('Task Title (required)'));
    await user.paste('a'.repeat(101));
    await user.tab();

    expect(screen.getByRole('alert')).toHaveTextContent('at most 100 characters');
  });

  it('shows an error when the description is longer than 1000 characters', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={vi.fn()} />);

    await user.click(screen.getByLabelText('Description'));
    await user.paste('a'.repeat(1001));
    await user.tab();

    expect(screen.getByRole('alert')).toHaveTextContent('at most 1000 characters');
  })

  it('shows no error for a valid title', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText('Task Title (required)'), 'Deploy app');
    await user.tab();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('does not submit and shows the error when the form is invalid', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Add task' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('submits the values with the title trimmed', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Task Title (required)'), '  Deploy app  ');
    await user.type(screen.getByLabelText('Description'), 'To staging');
    await user.selectOptions(screen.getByLabelText('Priority'), 'high');
    await user.selectOptions(screen.getByLabelText('Status'), 'in_progress');
    await user.click(screen.getByRole('button', { name: 'Add task' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Deploy app',
      description: 'To staging',
      priority: 'high',
      status: 'in_progress',
    });
  });


  it('disables the button and ignores a second submit while saving', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<TaskForm isSubmitting onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Task Title (required)'), 'Deploy app');
    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Saving...' }));
    expect(onSubmit).not.toHaveBeenCalled();

  })

  it('links the error to the input with aria-describedby', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={vi.fn()} />);
  
    await user.click(screen.getByRole('button', { name: 'Add task' }));
  
    const input = screen.getByLabelText('Task Title (required)');
    const message = await screen.findByText('Title must be at least 3 characters');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute(
      'aria-describedby',
      expect.stringContaining(message.id)
    );
  });
  
  it('has no accessibility violations', async () => {
    const { container } = render(<TaskForm onSubmit={vi.fn()} />);
    const result = await axe(container);
    // @ts-expect-error ts is not recognising the toHaveNoViolations is present
    expect(result).toHaveNoViolations();
  });

  it("links the title field to the length hint", () => {
    render(<TaskForm onSubmit={vi.fn()} />);
  
    const titleInput = screen.getByLabelText("Task Title (required)");
    const hint = screen.getByText("3–100 characters");
  
    expect(hint).toBeInTheDocument();
    expect(titleInput).toHaveAttribute(
      "aria-describedby",
      expect.stringContaining(hint.id)
    );
  });
});

describe('TaskForm: edit mode', () => {
  it('starts filled with the values of the task', () => {
    render(<TaskForm task={makeTask()} onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('Task Title (required)')).toHaveValue('Write report');
    expect(screen.getByLabelText('Description')).toHaveValue('Quarterly report');
    expect(screen.getByLabelText('Priority')).toHaveValue('high');
    expect(screen.getByLabelText('Status')).toHaveValue('in_progress');
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
  });

  it('submits the changed values', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TaskForm task={makeTask()} onSubmit={onSubmit} />);

    await user.clear(screen.getByLabelText('Task Title (required)'));
    await user.type(screen.getByLabelText('Task Title (required)'), 'Write the final report');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Write the final report',
      description: 'Quarterly report',
      priority: 'high',
      status: 'in_progress',
    });
  });

  it('keeps the values after saving', async () => {
    const user = userEvent.setup();
    render(<TaskForm task={makeTask()} onSubmit={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(screen.getByLabelText('Task Title (required)')).toHaveValue('Write report');
  });

  it('restores the original values when Reset is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskForm task={makeTask()} onSubmit={vi.fn()} />);

    await user.clear(screen.getByLabelText('Task Title (required)'));
    await user.type(screen.getByLabelText('Task Title (required)'), 'Something else');
    await user.selectOptions(screen.getByLabelText('Priority'), 'low');
    await user.click(screen.getByRole('button', { name: 'Reset' }));

    expect(screen.getByLabelText('Task Title (required)')).toHaveValue('Write report');
    expect(screen.getByLabelText('Priority')).toHaveValue('high');
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<TaskForm task={makeTask()} onSubmit={vi.fn()} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});