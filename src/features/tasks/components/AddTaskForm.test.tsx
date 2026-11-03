import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http as rest, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '../../../mocks/server';
import { AddTaskForm } from './AddTaskForm';

function renderForm() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AddTaskForm />
    </QueryClientProvider>,
  );
}

function gate() {
  let release!: () => void;
  const opened = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { opened, release };
}

const typeName = (value: string) =>
  fireEvent.change(screen.getByLabelText('Task name'), { target: { value } });

describe('AddTaskForm', () => {
  it('disables the button while saving and never sends two requests', async () => {
    const g = gate();
    let requests = 0;
    server.use(
      rest.post('/api/tasks', async () => {
        requests++;
        await g.opened;
        return HttpResponse.json({ message: 'Boom' }, { status: 500 });
      }),
    );
    renderForm();

    typeName('Write docs');
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }));

    expect(await screen.findByRole('button', { name: 'Saving...' })).toBeDisabled();

    // a second submit (for example pressing Enter) must be ignored
    fireEvent.submit(screen.getByRole('form', { name: 'Add task' }));

    g.release();
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(requests).toBe(1);
  });

  it('keeps the typed text and shows the error when saving fails', async () => {
    server.use(
      rest.post('/api/tasks', () =>
        HttpResponse.json({ message: 'Boom' }, { status: 500 }),
      ),
    );
    renderForm();

    typeName('Write docs');
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Boom');
    expect(screen.getByLabelText('Task name')).toHaveValue('Write docs');
    expect(screen.getByRole('button', { name: 'Add task' })).toBeEnabled();
  });

  it('clears the input after a successful save', async () => {
    renderForm();

    typeName('Write docs');
    expect(screen.getByLabelText('Task name')).toHaveValue('Write docs');
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }));

    await waitFor(() => expect(screen.getByLabelText('Task name')).toHaveValue(''));
  });
});