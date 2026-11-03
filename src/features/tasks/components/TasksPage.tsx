import { useState } from 'react';
import {
  useCreateTask,
  useDeleteTask,
  useMoveTaskStatus,
  useUpdateTask,
} from '../../../shared/api/useTaskMutations';
import type { TaskFilters } from '../../../shared/api/tasksApi';
import { useTasksQuery } from '../../../shared/api/useTasksQuery';
import type { Priority, TaskStatus } from '../model';
import { useTaskUrlFilters, type SortKey } from '../useTaskUrlFilters';
import { viewTasks } from '../viewTasks';
import { TaskEditor, type TaskFormValues } from './TaskEditor';

export function TasksPage() {
  const { filters, setFilters } = useTaskUrlFilters();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [createFormKey, setCreateFormKey] = useState(0);


  const serverFilters: TaskFilters = {};
  if (filters.status) serverFilters.status = filters.status;
  if (filters.q) serverFilters.q = filters.q;

  const list = useTasksQuery(serverFilters, { throwOnError: true });
  const all = useTasksQuery({}); 

  const create = useCreateTask();
  const update = useUpdateTask();
  const remove = useDeleteTask();
  const move = useMoveTaskStatus();

  const visible = viewTasks(list.data ?? [], filters);
  const editing = all.data?.find((t) => t.id === editingId);
  const counts = { todo: 0, in_progress: 0, done: 0 };
  for (const task of all.data ?? []) counts[task.status]++;

  function handleCreate(values: TaskFormValues) {
    create.mutate(values, { onSuccess: () => setCreateFormKey((k) => k + 1) });
  }

  function handleUpdate(id: number, values: TaskFormValues) {
    update.mutate({ id, changes: values }, { onSuccess: () => setEditingId(null) });
  }

  return (
    <main>
      {editing ? (
        <TaskEditor
          key={editing.id}
          initial={editing}
          isSubmitting={update.isPending}
          error={update.error?.message}
          onSubmit={(values) => handleUpdate(editing.id, values)}
          onCancel={() => setEditingId(null)}
        />
      ) : (
        <TaskEditor
          key={createFormKey}
          isSubmitting={create.isPending}
          error={create.error?.message}
          onSubmit={handleCreate}
        />
      )}

      <h2>Tasks</h2>
      <p>To do: {counts.todo}</p>
      <p>In progress: {counts.in_progress}</p>
      <p>Done: {counts.done}</p>

      <div>
        <input
          aria-label="Search tasks"
          placeholder="Search tasks"
          value={filters.q}
          onChange={(e) => setFilters({ q: e.target.value })}
        />
        <select
          aria-label="Filter by status"
          value={filters.status ?? ''}
          onChange={(e) =>
            setFilters({ status: (e.target.value || undefined) as TaskStatus | undefined })
          }
        >
          <option value="">All</option>
          <option value="todo">To do</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>
        <select
          aria-label="Filter by priority"
          value={filters.priority ?? ''}
          onChange={(e) =>
            setFilters({ priority: (e.target.value || undefined) as Priority | undefined })
          }
        >
          <option value="">All</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          aria-label="Sort by"
          value={filters.sort}
          onChange={(e) => setFilters({ sort: e.target.value as SortKey })}
        >
          <option value="priority">Priority (high first)</option>
          <option value="date">Newest first</option>
        </select>
      </div>

      {move.isError && <p role="alert">Could not change status: {move.error.message}</p>}
      {remove.isError && <p role="alert">Could not delete: {remove.error.message}</p>}
      {list.isFetching && !list.isPending && <p>Updating...</p>}

      {list.isPending ? (
        <p>Loading...</p>
      ) : all.data?.length === 0 ? (
        <p>No tasks yet. Add your first task above.</p>
      ) : visible.length === 0 ? (
        <p>No tasks match your filters</p>
      ) : (
        <ul>
          {visible.map((task) => (
            <li key={task.id}>
              <strong>{task.name}</strong> ({task.priority})
              {task.description && <span> {task.description}</span>}
              <select
                aria-label={`Status of ${task.name}`}
                value={task.status}
                onChange={(e) =>
                  move.mutate({ id: task.id, status: e.target.value as TaskStatus })
                }
              >
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
              </select>
              <button type="button" aria-label={`Edit ${task.name}`} onClick={() => setEditingId(task.id)}>
                Edit
              </button>
              <button type="button" aria-label={`Delete ${task.name}`} onClick={() => remove.mutate(task.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}