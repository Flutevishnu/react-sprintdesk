import { useState, type FormEvent } from 'react';
import { useCreateTask } from '../../../shared/api/useTaskMutations';

export function AddTaskForm() {
  const [name, setName] = useState('');
  const create = useCreateTask();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (create.isPending) return;

    const trimmed = name.trim();
    if (!trimmed) return;

    create.mutate(
      { name: trimmed, priority: 'medium' },
      { onSuccess: () => setName('') }, 
    );
  }

  return (
    <form aria-label="Add task" onSubmit={handleSubmit}>
      <label>
        Task name
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <button type="submit" disabled={create.isPending}>
        {create.isPending ? 'Saving...' : 'Add task'}
      </button>
      {create.isError && <p role="alert">{create.error.message}</p>}
    </form>
  );
}