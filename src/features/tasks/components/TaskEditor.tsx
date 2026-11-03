import { useState, type FormEvent } from 'react';
import type { Priority, Task, TaskStatus } from '../model';

export interface TaskFormValues {
  name: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
}

interface TaskEditorProps {
  initial?: Task;
  isSubmitting: boolean;
  error?: string | null;
  onSubmit: (values: TaskFormValues) => void;
  onCancel?: () => void;
}

const MIN_NAME = 3;

export function TaskEditor({ initial, isSubmitting, error, onSubmit, onCancel }: TaskEditorProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'medium');
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? 'todo');
  const [touched, setTouched] = useState(false);


  const nameError =
    name.trim().length < MIN_NAME ? `Title must be at least ${MIN_NAME} characters` : null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (isSubmitting || nameError) return;
    onSubmit({ name: name.trim(), description: description.trim(), priority, status });
  }

  function handleReset() {
    setName(initial?.name ?? '');
    setDescription(initial?.description ?? '');
    setPriority(initial?.priority ?? 'medium');
    setStatus(initial?.status ?? 'todo');
    setTouched(false);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2>{initial ? 'Edit task' : 'Add a task'}</h2>

      <label>
        Title
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched(true)}
        />
      </label>
      {touched && nameError && <p>{nameError}</p>}

      <label>
        Description
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>

      <label>
        Priority
        <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
        </select>
      </label>

      <label>
        Status
        <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
          <option value="todo">todo</option>
          <option value="in_progress">in progress</option>
          <option value="done">done</option>
        </select>
      </label>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : initial ? 'Save changes' : 'Add task'}
      </button>
      <button type="button" onClick={handleReset}>Reset</button>
      {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}

      {error && <p role="alert">{error}</p>}
    </form>
  );
}